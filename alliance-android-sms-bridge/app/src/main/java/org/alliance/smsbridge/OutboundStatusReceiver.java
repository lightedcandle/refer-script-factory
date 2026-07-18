package org.alliance.smsbridge;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.telephony.SmsManager;
import android.util.Log;

import java.io.BufferedWriter;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class OutboundStatusReceiver extends BroadcastReceiver {
    static final String ACTION_SMS_SENT = "org.alliance.smsbridge.SMS_SENT";
    static final String ACTION_SMS_DELIVERED = "org.alliance.smsbridge.SMS_DELIVERED";

    static final String EXTRA_TRACKING_ID = "tracking_id";
    static final String EXTRA_TO = "to";
    static final String EXTRA_BODY = "body";
    static final String EXTRA_SENT_AT = "sent_at";
    static final String EXTRA_REPORT_TO_CLOUD = "report_to_cloud";

    private static final String TAG = "AllianceSmsBridge";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) {
            return;
        }

        String action = intent.getAction();
        String trackingId = intent.getStringExtra(EXTRA_TRACKING_ID);
        String to = intent.getStringExtra(EXTRA_TO);
        String body = intent.getStringExtra(EXTRA_BODY);
        long sentAt = intent.getLongExtra(EXTRA_SENT_AT, System.currentTimeMillis());
        boolean reportToCloud = intent.getBooleanExtra(EXTRA_REPORT_TO_CLOUD, false);
        String status = resolveStatus(action, getResultCode());
        String error = resolveError(action, getResultCode());

        BridgeConfig.setLastOutbound(context, to, body, sentAt, status, trackingId, error);
        Log.i(TAG, "Outbound SMS " + status + " tracking=" + safe(trackingId) + " to=" + safe(to));

        if (reportToCloud && trackingId != null && !trackingId.isEmpty()) {
            final String reportId = trackingId;
            final String reportStatus = status;
            final String reportError = error;
            new Thread(() -> reportToCloud(context, reportId, reportStatus, reportError), "alliance-sms-report").start();
        }
    }

    private String resolveStatus(String action, int resultCode) {
        if (ACTION_SMS_DELIVERED.equals(action)) {
            return resultCode == Activity.RESULT_OK ? "delivered" : "delivery_failed";
        }
        if (ACTION_SMS_SENT.equals(action)) {
            return resultCode == Activity.RESULT_OK ? "sent" : "send_failed";
        }
        return "unknown";
    }

    private String resolveError(String action, int resultCode) {
        if (resultCode == Activity.RESULT_OK) {
            return "";
        }
        if (ACTION_SMS_DELIVERED.equals(action)) {
            return resultCodeToError(resultCode, "delivery");
        }
        return resultCodeToError(resultCode, "send");
    }

    private String resultCodeToError(int resultCode, String phase) {
        if (resultCode == SmsManager.RESULT_ERROR_GENERIC_FAILURE) {
            return phase + "_generic_failure";
        }
        if (resultCode == SmsManager.RESULT_ERROR_NO_SERVICE) {
            return phase + "_no_service";
        }
        if (resultCode == SmsManager.RESULT_ERROR_NULL_PDU) {
            return phase + "_null_pdu";
        }
        if (resultCode == SmsManager.RESULT_ERROR_RADIO_OFF) {
            return phase + "_radio_off";
        }
        if (resultCode == SmsManager.RESULT_ERROR_LIMIT_EXCEEDED) {
            return phase + "_limit_exceeded";
        }
        return phase + "_code_" + resultCode;
    }

    private void reportToCloud(Context context, String trackingId, String status, String error) {
        try {
            String base = BridgeConfig.cloudUrl(context);
            String token = BridgeConfig.cloudToken(context);
            if (base == null || base.isEmpty() || token == null || token.isEmpty()) {
                return;
            }

            URL url = new URL(base.replaceAll("/$", "") + "/phone/report");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("X-Dispatcher-Token", token);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            connection.setDoOutput(true);

            String payload = "{\"id\":\"" + escapeJson(trackingId)
                    + "\",\"status\":\"" + escapeJson(status)
                    + "\",\"error\":\"" + escapeJson(error) + "\"}";
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(connection.getOutputStream(), StandardCharsets.UTF_8))) {
                writer.write(payload);
            }

            int response = connection.getResponseCode();
            if (response < 200 || response >= 300) {
                Log.w(TAG, "Cloud outbound report returned " + response + " for tracking=" + safe(trackingId));
            }
        } catch (Exception cloudError) {
            Log.w(TAG, "Failed to report outbound status to cloud", cloudError);
        }
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\r", "\\r").replace("\n", "\\n");
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
