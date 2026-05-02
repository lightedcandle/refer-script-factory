package org.alliance.smsbridge;

import android.content.Context;
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

final class CloudRelay {
    private static final String TAG = "AllianceCloudRelay";
    private final Context context;
    private Thread worker;
    private volatile boolean running;

    CloudRelay(Context context) {
        this.context = context.getApplicationContext();
    }

    void start() {
        if (running) return;
        running = true;
        worker = new Thread(this::loop, "alliance-cloud-relay");
        worker.start();
    }

    void stop() {
        running = false;
        if (worker != null) worker.interrupt();
    }

    private void loop() {
        while (running) {
            try {
                if (BridgeConfig.cloudEnabled(context)) {
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

    private void pullOutbound() throws Exception {
        String body = request("GET", "/phone/next", null);
        if (!body.contains("\"job\"")) return;
        String id = jsonString(body, "id");
        String to = jsonString(body, "to");
        String message = jsonString(body, "message");
        if (id == null || to == null || message == null) return;

        try {
            sendSms(to, message);
            BridgeConfig.setLastOutbound(context, to, message, System.currentTimeMillis());
            request("POST", "/phone/report", "{\"id\":\"" + escapeJson(id) + "\",\"status\":\"sent\"}");
        } catch (Exception error) {
            request("POST", "/phone/report", "{\"id\":\"" + escapeJson(id) + "\",\"status\":\"failed\",\"error\":\"" + escapeJson(error.getMessage()) + "\"}");
        }
    }

    private void sendSms(String to, String message) {
        SmsManager manager = SmsManager.getDefault();
        ArrayList<String> parts = manager.divideMessage(message);
        if (parts.size() <= 1) {
            manager.sendTextMessage(to, null, message, null, null);
            return;
        }
        manager.sendMultipartTextMessage(to, null, parts, null, null);
    }

    private void pushInbound() throws Exception {
        long last = BridgeConfig.lastInboundAt(context);
        try (Cursor cursor = context.getContentResolver().query(
                Uri.parse("content://sms/inbox"),
                new String[]{"address", "body", "date"},
                "date > ?",
                new String[]{String.valueOf(last)},
                "date ASC LIMIT 10"
        )) {
            if (cursor == null) return;
            while (cursor.moveToNext()) {
                String from = cursor.getString(cursor.getColumnIndexOrThrow("address"));
                String body = cursor.getString(cursor.getColumnIndexOrThrow("body"));
                long date = cursor.getLong(cursor.getColumnIndexOrThrow("date"));
                if (isSelfMessage(from) || isRecentOutboundEcho(from, body, date)) {
                    BridgeConfig.setLastInboundAt(context, date);
                    continue;
                }
                request("POST", "/phone/inbound", "{\"from\":\"" + escapeJson(from)
                        + "\",\"body\":\"" + escapeJson(body)
                        + "\",\"date\":" + date + "}");
                BridgeConfig.setLastInboundAt(context, date);
            }
        }
    }

    private boolean isSelfMessage(String from) {
        String self = BridgeConfig.selfPhone(context);
        if (self == null || self.isEmpty()) return false;
        String fromDigits = BridgeConfig.onlyDigits(from);
        return fromDigits.equals(self) || fromDigits.endsWith(self) || self.endsWith(fromDigits);
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

    private String request(String method, String path, String payload) throws Exception {
        String base = BridgeConfig.cloudUrl(context);
        String token = BridgeConfig.cloudToken(context);
        if (base == null || base.isEmpty() || token == null || token.isEmpty()) return "";

        URL url = new URL(base.replaceAll("/$", "") + path);
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

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                connection.getResponseCode() >= 400 ? connection.getErrorStream() : connection.getInputStream(),
                StandardCharsets.UTF_8
        ))) {
            StringBuilder body = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) body.append(line);
            return body.toString();
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
