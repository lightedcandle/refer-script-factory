package org.alliance.smsbridge;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import java.util.UUID;

import org.json.JSONArray;
import org.json.JSONObject;

final class BridgeConfig {
    static final int PORT = 8787;
    static final String ACTION_START = "org.alliance.smsbridge.START";
    static final String ACTION_STOP = "org.alliance.smsbridge.STOP";
    static final String ACTION_WATCHDOG = "org.alliance.smsbridge.WATCHDOG";
    static final long WATCHDOG_INTERVAL_MS = 5 * 60 * 1000L;

    private static final String PREFS = "alliance_sms_bridge";
    private static final String KEY_CLOUD_ENABLED = "cloud_enabled";
    private static final String KEY_CLOUD_TOKEN = "cloud_token";
    private static final String KEY_CLOUD_URL = "cloud_url";
    private static final String KEY_ENABLED = "bridge_enabled";
    private static final String KEY_LAST_INBOUND_AT = "last_inbound_at";
    private static final String KEY_LAST_OUTBOUND_AT = "last_outbound_at";
    private static final String KEY_LAST_OUTBOUND_BODY = "last_outbound_body";
    private static final String KEY_LAST_OUTBOUND_ERROR = "last_outbound_error";
    private static final String KEY_LAST_OUTBOUND_STATUS = "last_outbound_status";
    private static final String KEY_LAST_OUTBOUND_TRACKING_ID = "last_outbound_tracking_id";
    private static final String KEY_LAST_OUTBOUND_TO = "last_outbound_to";
    private static final String KEY_INBOUND_HISTORY = "inbound_history";
    private static final String KEY_INBOUND_QUEUE = "inbound_queue";
    private static final String KEY_RUNNING = "bridge_running";
    private static final String KEY_SELF_PHONE = "self_phone";
    private static final String KEY_TOKEN = "bridge_token";
    private static final int MAX_INBOUND_HISTORY = 10;

    private BridgeConfig() {
    }

    static String token(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String existing = prefs.getString(KEY_TOKEN, null);
        if (existing != null && !existing.isEmpty()) {
            return existing;
        }

        String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        prefs.edit().putString(KEY_TOKEN, token).apply();
        return token;
    }

    static boolean enabled(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(KEY_ENABLED, false);
    }

    static void setEnabled(Context context, boolean enabled) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean(KEY_ENABLED, enabled).apply();
    }

    static boolean running(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(KEY_RUNNING, false);
    }

    static void setRunning(Context context, boolean running) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean(KEY_RUNNING, running).apply();
    }

    static void scheduleWatchdog(Context context) {
        AlarmManager alarmManager = context.getSystemService(AlarmManager.class);
        if (alarmManager == null) {
            return;
        }

        PendingIntent intent = watchdogIntent(context);
        long triggerAt = System.currentTimeMillis() + WATCHDOG_INTERVAL_MS;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, intent);
        } else {
            alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAt, intent);
        }
    }

    static void cancelWatchdog(Context context) {
        AlarmManager alarmManager = context.getSystemService(AlarmManager.class);
        if (alarmManager == null) {
            return;
        }
        alarmManager.cancel(watchdogIntent(context));
    }

    private static PendingIntent watchdogIntent(Context context) {
        Intent intent = new Intent(context, BridgeWatchdogReceiver.class);
        intent.setAction(ACTION_WATCHDOG);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getBroadcast(context, 8787, intent, flags);
    }

    static boolean cloudEnabled(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(KEY_CLOUD_ENABLED, false);
    }

    static String cloudUrl(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_CLOUD_URL, "");
    }

    static String cloudToken(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_CLOUD_TOKEN, "");
    }

    static void setCloudRelay(Context context, String url, String token, boolean enabled) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_CLOUD_URL, url == null ? "" : url)
                .putString(KEY_CLOUD_TOKEN, token == null ? "" : token)
                .putBoolean(KEY_CLOUD_ENABLED, enabled)
                .apply();
    }

    static String selfPhone(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_SELF_PHONE, "");
    }

    static void setSelfPhone(Context context, String phone) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_SELF_PHONE, phone == null ? "" : onlyDigits(phone))
                .apply();
    }

    static long lastInboundAt(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getLong(KEY_LAST_INBOUND_AT, 0L);
    }

    static void setLastInboundAt(Context context, long value) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putLong(KEY_LAST_INBOUND_AT, value).apply();
    }

    static void addInboundHistory(Context context, String from, String body, long date, String status) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        JSONArray history = parseHistory(prefs.getString(KEY_INBOUND_HISTORY, "[]"));
        JSONObject item = new JSONObject();
        try {
            item.put("from", from == null ? "" : from);
            item.put("body", body == null ? "" : body);
            item.put("date", date);
            item.put("status", status == null ? "unknown" : status);
            history.put(item);
            while (history.length() > MAX_INBOUND_HISTORY) {
                JSONArray trimmed = new JSONArray();
                for (int index = history.length() - MAX_INBOUND_HISTORY; index < history.length(); index++) {
                    trimmed.put(history.get(index));
                }
                history = trimmed;
            }
            prefs.edit().putString(KEY_INBOUND_HISTORY, history.toString()).apply();
        } catch (Exception ignored) {
        }
    }

    static String inboundHistory(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_INBOUND_HISTORY, "[]");
    }

    static String inboundQueue(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_INBOUND_QUEUE, "[]");
    }

    static void setInboundQueue(Context context, String raw) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY_INBOUND_QUEUE, raw == null ? "[]" : raw).apply();
    }

    static void upsertInboundHistory(
            Context context,
            String messageId,
            String from,
            String body,
            long date,
            String status,
            int attempts,
            long nextAttemptAt,
            String lastError
    ) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        JSONArray history = parseHistory(prefs.getString(KEY_INBOUND_HISTORY, "[]"));
        JSONObject item = new JSONObject();
        try {
            item.put("message_id", messageId == null ? "" : messageId);
            item.put("from", from == null ? "" : from);
            item.put("body", body == null ? "" : body);
            item.put("date", date);
            item.put("status", status == null ? "unknown" : status);
            item.put("attempts", Math.max(0, attempts));
            item.put("next_attempt_at", Math.max(0L, nextAttemptAt));
            item.put("last_error", lastError == null ? "" : lastError);

            JSONArray updated = new JSONArray();
            boolean replaced = false;
            for (int index = 0; index < history.length(); index++) {
                JSONObject existing = history.getJSONObject(index);
                if (!replaced && messageId != null && messageId.equals(existing.optString("message_id", ""))) {
                    updated.put(item);
                    replaced = true;
                } else {
                    updated.put(existing);
                }
            }
            if (!replaced) {
                updated.put(item);
            }

            while (updated.length() > MAX_INBOUND_HISTORY) {
                JSONArray trimmed = new JSONArray();
                for (int index = updated.length() - MAX_INBOUND_HISTORY; index < updated.length(); index++) {
                    trimmed.put(updated.get(index));
                }
                updated = trimmed;
            }

            prefs.edit().putString(KEY_INBOUND_HISTORY, updated.toString()).apply();
        } catch (Exception ignored) {
        }
    }

    static void setLastOutbound(Context context, String to, String body, long sentAt) {
        setLastOutbound(context, to, body, sentAt, "queued", "", "");
    }

    static void setLastOutbound(Context context, String to, String body, long sentAt, String status, String trackingId, String error) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_LAST_OUTBOUND_TO, onlyDigits(to))
                .putString(KEY_LAST_OUTBOUND_BODY, body == null ? "" : body)
                .putLong(KEY_LAST_OUTBOUND_AT, sentAt)
                .putString(KEY_LAST_OUTBOUND_STATUS, status == null ? "unknown" : status)
                .putString(KEY_LAST_OUTBOUND_TRACKING_ID, trackingId == null ? "" : trackingId)
                .putString(KEY_LAST_OUTBOUND_ERROR, error == null ? "" : error)
                .apply();
    }

    static String lastOutboundTo(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_LAST_OUTBOUND_TO, "");
    }

    static String lastOutboundBody(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_LAST_OUTBOUND_BODY, "");
    }

    static long lastOutboundAt(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getLong(KEY_LAST_OUTBOUND_AT, 0L);
    }

    static String lastOutboundStatus(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_LAST_OUTBOUND_STATUS, "unknown");
    }

    static String lastOutboundTrackingId(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_LAST_OUTBOUND_TRACKING_ID, "");
    }

    static String lastOutboundError(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_LAST_OUTBOUND_ERROR, "");
    }

    static String onlyDigits(String value) {
        if (value == null) return "";
        return value.replaceAll("\\D+", "");
    }

    private static JSONArray parseHistory(String raw) {
        try {
            return new JSONArray(raw == null || raw.isEmpty() ? "[]" : raw);
        } catch (Exception ignored) {
            return new JSONArray();
        }
    }
}
