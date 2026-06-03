package org.alliance.smsbridge;

import android.content.Context;
import android.app.PendingIntent;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.telephony.SmsManager;
import android.util.Log;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

final class CloudRelay {
    private static final String TAG = "AllianceCloudRelay";
    private static final long BASE_RETRY_DELAY_MS = 5000L;
    private static final long MAX_RETRY_DELAY_MS = 300000L;
    private final Context context;
    private Thread worker;
    private volatile boolean running;

    private static final class HttpResponse {
        final int status;
        final String body;

        HttpResponse(int status, String body) {
            this.status = status;
            this.body = body == null ? "" : body;
        }
    }

    private static class ScheduledTask {
        String name;
        long intervalMs;
        long lastEpoch;
        Runnable action;

        ScheduledTask(String name, long intervalMs, Runnable action) {
            this.name = name;
            this.intervalMs = intervalMs;
            this.lastEpoch = 0;
            this.action = action;
        }

        void runIfDue(long now) {
            if (now - lastEpoch >= intervalMs) {
                try {
                    action.run();
                } catch (Exception e) {
                    Log.e("ScheduledTask", "Task " + name + " failed", e);
                }
                lastEpoch = now;
            }
        }
    }

    private final List<ScheduledTask> registry = Collections.synchronizedList(new ArrayList<>());

    CloudRelay(Context context) {
        this.context = context.getApplicationContext();
        registry.add(new ScheduledTask("system_minute_pulse", 60000, () -> sendPulse("minute")));
        registry.add(new ScheduledTask("system_hourly_pulse", 3600000, () -> sendPulse("hourly")));
    }

    void start() {
        if (running && worker != null && worker.isAlive()) return;
        running = true;
        synchronized(registry) {
            for (ScheduledTask task : registry) task.lastEpoch = 0;
        }
        worker = new Thread(this::loop, "alliance-cloud-relay");
        worker.start();
    }

    boolean isAlive() {
        return running && worker != null && worker.isAlive();
    }

    void stop() {
        running = false;
        if (worker != null) worker.interrupt();
    }

    private void loop() {
        while (running) {
            try {
                if (BridgeConfig.cloudEnabled(context)) {
                    long now = System.currentTimeMillis();
                    synchronized(registry) {
                        for (ScheduledTask task : registry) {
                            task.runIfDue(now);
                        }
                    }

                    pullOutbound();
                    pushInbound();
                }
                Thread.sleep(8000);
            } catch (InterruptedException ignored) {
                return;
            } catch (Exception error) {
                Log.e(TAG, "Cloud relay cycle failed", error);
            }
        }
    }

    private void sendPulse(String type) {
        try {
            String payload = "{\"type\":\"" + type + "\",\"timestamp\":" + System.currentTimeMillis() + "}";
            if ("hourly".equals(type)) {
                android.content.Intent batteryStatus = context.registerReceiver(null, new android.content.IntentFilter(android.content.Intent.ACTION_BATTERY_CHANGED));
                int level = batteryStatus != null ? batteryStatus.getIntExtra(android.os.BatteryManager.EXTRA_LEVEL, -1) : -1;
                payload = "{\"type\":\"hourly\",\"battery\":" + level + ",\"timestamp\":" + System.currentTimeMillis() + "}";
            }
            request("POST", "/phone/pulse", payload);
            Log.i(TAG, "Sent " + type + " pulse to cloud");
        } catch (Exception error) {
            Log.w(TAG, "Failed to send " + type + " pulse", error);
        }
    }

    private void pullOutbound() throws Exception {
        String body = request("GET", "/phone/next", null).body;
        if (!body.contains("\"job\"")) return;
        
        String id = jsonString(body, "id");
        String type = jsonString(body, "type");
        if (id == null) return;
        if (type == null) type = "sms";

        long repeatInterval = jsonLong(body, "repeat_interval");
        if (repeatInterval > 0) {
            registerRhythmicTask(id, type, repeatInterval, body);
        }
        
        try {
            executeJob(id, type, body);
            request("POST", "/phone/report", "{\"id\":\"" + escapeJson(id) + "\",\"status\":\"sent\"}");
        } catch (Exception error) {
            request("POST", "/phone/report", "{\"id\":\"" + escapeJson(id) + "\",\"status\":\"failed\",\"error\":\"" + escapeJson(error.getMessage()) + "\"}");
        }
    }

    private void registerRhythmicTask(String id, String type, long intervalMs, String body) {
        synchronized(registry) {
            for (int i = 0; i < registry.size(); i++) {
                if (registry.get(i).name.equals(id)) {
                    registry.remove(i);
                    break;
                }
            }
            registry.add(new ScheduledTask(id, intervalMs, () -> {
                try {
                    executeJob(id, type, body);
                } catch (Exception e) {
                    Log.e(TAG, "Rhythmic task " + id + " failed", e);
                }
            }));
            Log.i(TAG, "Registered rhythmic task: " + id + " every " + intervalMs + "ms");
        }
    }

    private void executeJob(String trackingId, String type, String body) throws Exception {
        if ("sms".equals(type)) {
            String to = jsonString(body, "to");
            String message = jsonString(body, "message");
            if (to != null && message != null) {
                sendSms(to, message, trackingId);
            }
        } else if ("pulse".equals(type)) {
            sendPulse("requested");
        }
    }

    private void sendSms(String to, String message, String trackingId) {
        SmsManager manager = SmsManager.getDefault();
        ArrayList<String> parts = manager.divideMessage(message);
        long sentAt = System.currentTimeMillis();
        if (parts.size() <= 1) {
            BridgeConfig.setLastOutbound(context, to, message, sentAt, "queued", trackingId, "");
            manager.sendTextMessage(
                    to,
                    null,
                    message,
                    statusIntent(OutboundStatusReceiver.ACTION_SMS_SENT, trackingId, to, message, 0, 1, true, sentAt),
                    statusIntent(OutboundStatusReceiver.ACTION_SMS_DELIVERED, trackingId, to, message, 0, 1, true, sentAt)
            );
            return;
        }
        ArrayList<PendingIntent> sentIntents = new ArrayList<>();
        ArrayList<PendingIntent> deliveryIntents = new ArrayList<>();
        for (int index = 0; index < parts.size(); index++) {
            sentIntents.add(statusIntent(OutboundStatusReceiver.ACTION_SMS_SENT, trackingId, to, message, index, parts.size(), true, sentAt));
            deliveryIntents.add(statusIntent(OutboundStatusReceiver.ACTION_SMS_DELIVERED, trackingId, to, message, index, parts.size(), true, sentAt));
        }
        BridgeConfig.setLastOutbound(context, to, message, sentAt, "queued", trackingId, "");
        manager.sendMultipartTextMessage(to, null, parts, sentIntents, deliveryIntents);
    }

    private PendingIntent statusIntent(String action, String trackingId, String to, String body, int partIndex, int partCount, boolean reportToCloud, long sentAt) {
        Intent intent = new Intent(context, OutboundStatusReceiver.class);
        intent.setAction(action);
        intent.putExtra(OutboundStatusReceiver.EXTRA_TRACKING_ID, trackingId);
        intent.putExtra(OutboundStatusReceiver.EXTRA_TO, to);
        intent.putExtra(OutboundStatusReceiver.EXTRA_BODY, body);
        intent.putExtra(OutboundStatusReceiver.EXTRA_SENT_AT, sentAt);
        intent.putExtra(OutboundStatusReceiver.EXTRA_REPORT_TO_CLOUD, reportToCloud);
        intent.putExtra("part_index", partIndex);
        intent.putExtra("part_count", partCount);
        int requestCode = Math.abs((trackingId + ":" + action + ":" + partIndex).hashCode());
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getBroadcast(context, requestCode, intent, flags);
    }

    private void pushInbound() throws Exception {
        enqueueInboundRows();
        flushInboundQueue();
    }

    private void enqueueInboundRows() throws Exception {
        long lastAcked = BridgeConfig.lastInboundAt(context);
        long recentCutoff = System.currentTimeMillis() - 24L * 60L * 60L * 1000L;
        long scanAfter = Math.max(lastAcked, recentCutoff);
        try (Cursor cursor = context.getContentResolver().query(
                Uri.parse("content://sms/inbox"),
                new String[]{"_id", "address", "body", "date"},
                "date > ?",
                new String[]{String.valueOf(scanAfter)},
                "date DESC"
        )) {
            if (cursor == null) return;
            List<JSONObject> rows = new ArrayList<>();
            JSONArray queue = loadInboundQueue();
            while (cursor.moveToNext()) {
                long smsId = cursor.getLong(cursor.getColumnIndexOrThrow("_id"));
                String from = cursor.getString(cursor.getColumnIndexOrThrow("address"));
                String body = cursor.getString(cursor.getColumnIndexOrThrow("body"));
                long date = cursor.getLong(cursor.getColumnIndexOrThrow("date"));
                String messageId = inboundMessageId(smsId, from, body, date);
                if (isSelfMessage(from) || isShortCodeSender(from) || isRecentOutboundEcho(from, body, date)) {
                    BridgeConfig.upsertInboundHistory(context, messageId, from, body, date, "filtered", 0, 0L, "");
                    BridgeConfig.setLastInboundAt(context, date);
                    continue;
                }
                if (queueContains(queue, messageId)) {
                    continue;
                }
                JSONObject item = new JSONObject();
                item.put("message_id", messageId);
                item.put("from", from == null ? "" : from);
                item.put("body", body == null ? "" : body);
                item.put("date", date);
                item.put("attempts", 0);
                item.put("next_attempt_at", 0L);
                item.put("last_error", "");
                rows.add(item);
            }
            rows.sort((left, right) -> Long.compare(right.optLong("date", 0L), left.optLong("date", 0L)));
            int end = Math.min(rows.size(), 10);
            for (int index = end - 1; index >= 0; index--) {
                JSONObject item = rows.get(index);
                queue.put(item);
                BridgeConfig.upsertInboundHistory(
                        context,
                        item.optString("message_id", ""),
                        item.optString("from", ""),
                        item.optString("body", ""),
                        item.optLong("date", 0L),
                        "queued",
                        0,
                        0L,
                        ""
                );
            }
            saveInboundQueue(queue);
        }
    }

    private void flushInboundQueue() throws Exception {
        JSONArray queue = loadInboundQueue();
        if (queue.length() == 0) {
            return;
        }

        long now = System.currentTimeMillis();
        boolean changed = false;
        for (int index = 0; index < queue.length(); index++) {
            JSONObject item = queue.getJSONObject(index);
            long nextAttemptAt = item.optLong("next_attempt_at", 0L);
            if (nextAttemptAt > now) {
                continue;
            }

            String messageId = item.optString("message_id", "");
            String from = item.optString("from", "");
            String body = item.optString("body", "");
            long date = item.optLong("date", 0L);
            int attempts = item.optInt("attempts", 0);

            try {
                HttpResponse response = request("POST", "/phone/inbound", inboundPayload(messageId, from, body, date));
                if (response.status < 200 || response.status >= 300 || !response.body.contains("\"ok\":true")) {
                    throw new IllegalStateException("bridge_inbound_ack_missing");
                }
                queue.remove(index);
                index--;
                changed = true;
                BridgeConfig.upsertInboundHistory(context, messageId, from, body, date, "forwarded", attempts, 0L, "");
                BridgeConfig.setLastInboundAt(context, Math.max(BridgeConfig.lastInboundAt(context), date));
                continue;
            } catch (Exception error) {
                attempts += 1;
                long delay = Math.min(MAX_RETRY_DELAY_MS, BASE_RETRY_DELAY_MS * (1L << Math.min(8, attempts - 1)));
                long next = now + delay;
                item.put("attempts", attempts);
                item.put("next_attempt_at", next);
                item.put("last_error", String.valueOf(error.getMessage()));
                queue.put(index, item);
                changed = true;
                BridgeConfig.upsertInboundHistory(context, messageId, from, body, date, "retrying", attempts, next, String.valueOf(error.getMessage()));
                saveInboundQueue(queue);
                break;
            }
        }

        if (changed) {
            saveInboundQueue(queue);
        }
    }

    private String inboundPayload(String messageId, String from, String body, long date) {
        return "{\"bridge_message_id\":\"" + escapeJson(messageId)
                + "\",\"from\":\"" + escapeJson(from)
                + "\",\"body\":\"" + escapeJson(body)
                + "\",\"date\":" + date
                + ",\"transport\":\"sms\"}";
    }

    private JSONArray loadInboundQueue() {
        try {
            return new JSONArray(BridgeConfig.inboundQueue(context));
        } catch (Exception ignored) {
            return new JSONArray();
        }
    }

    private void saveInboundQueue(JSONArray queue) {
        BridgeConfig.setInboundQueue(context, queue == null ? "[]" : queue.toString());
    }

    private boolean queueContains(JSONArray queue, String messageId) {
        if (queue == null || messageId == null || messageId.isEmpty()) return false;
        for (int index = 0; index < queue.length(); index++) {
            JSONObject item = queue.optJSONObject(index);
            if (item != null && messageId.equals(item.optString("message_id", ""))) {
                return true;
            }
        }
        return false;
    }

    private String inboundMessageId(long smsId, String from, String body, long date) {
        return "sms:" + smsId + ":" + BridgeConfig.onlyDigits(from) + ":" + date;
    }

    private boolean isSelfMessage(String from) {
        String self = BridgeConfig.selfPhone(context);
        if (self == null || self.isEmpty()) return false;
        String fromDigits = BridgeConfig.onlyDigits(from);
        return fromDigits.equals(self) || fromDigits.endsWith(self) || self.endsWith(fromDigits);
    }

    private boolean isShortCodeSender(String from) {
        String fromDigits = BridgeConfig.onlyDigits(from);
        return fromDigits != null && !fromDigits.isEmpty() && fromDigits.length() < 10;
    }

    private boolean isRecentOutboundEcho(String from, String body, long date) {
        String outboundBody = BridgeConfig.lastOutboundBody(context);
        if (outboundBody == null || outboundBody.isEmpty() || body == null) return false;
        if (!outboundBody.trim().equals(body.trim())) return false;
        long sentAt = BridgeConfig.lastOutboundAt(context);
        if (sentAt <= 0 || Math.abs(date - sentAt) > 10 * 60 * 1000L) return false;
        String outboundTo = BridgeConfig.lastOutboundTo(context);
        if (outboundTo == null || outboundTo.isEmpty()) return true;
        String fromDigits = BridgeConfig.onlyDigits(from);
        return fromDigits.equals(outboundTo) || fromDigits.endsWith(outboundTo) || outboundTo.endsWith(fromDigits);
    }

    private HttpResponse request(String method, String path, String payload) throws Exception {
        String base = BridgeConfig.cloudUrl(context);
        String token = BridgeConfig.cloudToken(context);
        if (base == null || base.isEmpty() || token == null || token.isEmpty()) return new HttpResponse(0, "");

        String self = BridgeConfig.selfPhone(context);
        String query = (self != null && !self.isEmpty()) ? "?bridge=" + Uri.encode(self) : "";
        URL url = new URL(base.replaceAll("/$", "") + path + query);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod(method);
        connection.setRequestProperty("X-Dispatcher-Token", token);
        connection.setConnectTimeout(10000);
        connection.setReadTimeout(10000);
        if (payload != null) {
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(connection.getOutputStream(), StandardCharsets.UTF_8))) {
                writer.write(payload);
            }
        }

        int status = connection.getResponseCode();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                status >= 400 ? connection.getErrorStream() : connection.getInputStream(),
                StandardCharsets.UTF_8
        ))) {
            StringBuilder body = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) body.append(line);
            return new HttpResponse(status, body.toString());
        }
    }

    private String jsonString(String json, String key) {
        String needle = "\"" + key + "\"";
        int keyIndex = json.indexOf(needle);
        if (keyIndex < 0) return null;
        int colon = json.indexOf(':', keyIndex + needle.length());
        int quoteStart = json.indexOf('"', colon + 1);
        if (colon < 0 || quoteStart < 0) return null;
        StringBuilder value = new StringBuilder();
        boolean escaped = false;
        for (int index = quoteStart + 1; index < json.length(); index++) {
            char current = json.charAt(index);
            if (escaped) {
                value.append(unescapeJsonChar(current));
                escaped = false;
            } else if (current == '\\') {
                escaped = true;
            } else if (current == '"') {
                return value.toString();
            } else {
                value.append(current);
            }
        }
        return null;
    }

    private long jsonLong(String json, String key) {
        String needle = "\"" + key + "\"";
        int keyIndex = json.indexOf(needle);
        if (keyIndex < 0) return 0;
        int colon = json.indexOf(':', keyIndex + needle.length());
        if (colon < 0) return 0;
        int start = -1;
        for (int i = colon + 1; i < json.length(); i++) {
            char c = json.charAt(i);
            if (Character.isDigit(c)) {
                start = i;
                break;
            }
            if (c == ',' || c == '}' || c == ']') break;
        }
        if (start < 0) return 0;
        StringBuilder value = new StringBuilder();
        for (int i = start; i < json.length(); i++) {
            char c = json.charAt(i);
            if (Character.isDigit(c)) value.append(c);
            else break;
        }
        try {
            return Long.parseLong(value.toString());
        } catch (Exception e) {
            return 0;
        }
    }

    private char unescapeJsonChar(char current) {
        if (current == 'n') return '\n';
        if (current == 'r') return '\r';
        if (current == 't') return '\t';
        return current;
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\r", "\\r").replace("\n", "\\n");
    }
}
