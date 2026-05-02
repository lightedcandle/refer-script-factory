package org.alliance.smsbridge;

import android.content.Context;
import android.content.SharedPreferences;

import java.util.UUID;

final class BridgeConfig {
    static final int PORT = 8787;
    static final String ACTION_START = "org.alliance.smsbridge.START";
    static final String ACTION_STOP = "org.alliance.smsbridge.STOP";

    private static final String PREFS = "alliance_sms_bridge";
    private static final String KEY_CLOUD_ENABLED = "cloud_enabled";
    private static final String KEY_CLOUD_TOKEN = "cloud_token";
    private static final String KEY_CLOUD_URL = "cloud_url";
    private static final String KEY_ENABLED = "bridge_enabled";
    private static final String KEY_LAST_INBOUND_AT = "last_inbound_at";
    private static final String KEY_LAST_OUTBOUND_AT = "last_outbound_at";
    private static final String KEY_LAST_OUTBOUND_BODY = "last_outbound_body";
    private static final String KEY_LAST_OUTBOUND_TO = "last_outbound_to";
    private static final String KEY_RUNNING = "bridge_running";
    private static final String KEY_SELF_PHONE = "self_phone";
    private static final String KEY_TOKEN = "bridge_token";

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

    static void setLastOutbound(Context context, String to, String body, long sentAt) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_LAST_OUTBOUND_TO, onlyDigits(to))
                .putString(KEY_LAST_OUTBOUND_BODY, body == null ? "" : body)
                .putLong(KEY_LAST_OUTBOUND_AT, sentAt)
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

    static String onlyDigits(String value) {
        if (value == null) return "";
        return value.replaceAll("\\D+", "");
    }
}
