package org.alliance.smsbridge;

import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.telephony.SmsManager;
import android.util.Log;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

final class BridgeHttpServer {
    private static final String TAG = "AllianceSmsBridge";
    private static final long MIN_SEND_INTERVAL_MS = 1000L;

    private final Context context;
    private final String token;
    private ServerSocket serverSocket;
    private Thread worker;
    private volatile boolean running;
    private long lastSendAt;

    BridgeHttpServer(Context context, String token) {
        this.context = context.getApplicationContext();
        this.token = token;
    }

    void start() throws IOException {
        if (running) {
            return;
        }

        serverSocket = new ServerSocket(BridgeConfig.PORT);
        running = true;
        worker = new Thread(this::serveLoop, "alliance-sms-bridge");
        worker.start();
    }

    void stop() {
        running = false;
        if (serverSocket != null) {
            try {
                serverSocket.close();
            } catch (IOException ignored) {
            }
        }
    }

    private void serveLoop() {
        while (running) {
            try {
                Socket socket = serverSocket.accept();
                handle(socket);
            } catch (IOException error) {
                if (running) {
                    Log.e(TAG, "Bridge accept failed", error);
                }
            }
        }
    }

    private void handle(Socket socket) {
        try (Socket closeable = socket;
             BufferedReader reader = new BufferedReader(new InputStreamReader(closeable.getInputStream(), StandardCharsets.UTF_8));
             BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(closeable.getOutputStream(), StandardCharsets.UTF_8))) {
            String requestLine = reader.readLine();
            if (requestLine == null || requestLine.isEmpty()) {
                return;
            }

            Map<String, String> headers = readHeaders(reader);
            int contentLength = parseInt(headers.get("content-length"));
            String body = readBody(reader, contentLength);

            if (requestLine.startsWith("GET /health ")) {
                writeJson(writer, 200, "{\"ok\":true,\"service\":\"alliance-sms-bridge\"}");
                return;
            }

            if (!token.equals(headers.get("x-bridge-token"))) {
                writeJson(writer, 401, "{\"ok\":false,\"error\":\"unauthorized\"}");
                return;
            }

            if (requestLine.startsWith("GET /sms/latest")) {
                writeJson(writer, 200, latestSmsJson(requestLine));
                return;
            }

            if (requestLine.startsWith("POST /config/cloud ")) {
                String url = jsonString(body, "url");
                String cloudToken = jsonString(body, "token");
                String enabled = jsonString(body, "enabled");
                BridgeConfig.setCloudRelay(context, url, cloudToken, !"false".equals(enabled));
                writeJson(writer, 200, "{\"ok\":true,\"cloud_relay_enabled\":true}");
                return;
            }

            if (!requestLine.startsWith("POST /sms/send ")) {
                writeJson(writer, 404, "{\"ok\":false,\"error\":\"not_found\"}");
                return;
            }

            long now = System.currentTimeMillis();
            if (now - lastSendAt < MIN_SEND_INTERVAL_MS) {
                writeJson(writer, 429, "{\"ok\":false,\"error\":\"rate_limited\"}");
                return;
            }

            String to = jsonString(body, "to");
            String message = jsonString(body, "message");
            if (to == null || to.length() < 7 || message == null || message.isEmpty()) {
                writeJson(writer, 400, "{\"ok\":false,\"error\":\"invalid_sms_payload\"}");
                return;
            }

            sendSms(to, message);
            lastSendAt = now;
            writeJson(writer, 200, "{\"ok\":true,\"status\":\"queued\"}");
        } catch (Exception error) {
            Log.e(TAG, "Bridge request failed", error);
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

    private String latestSmsJson(String requestLine) {
        String from = queryValue(requestLine, "from");
        String normalizedFrom = digitsOnly(from);
        String selection = null;
        String[] selectionArgs = null;

        if (normalizedFrom != null && !normalizedFrom.isEmpty()) {
            selection = "address LIKE ?";
            selectionArgs = new String[]{"%" + normalizedFrom};
        }

        try (Cursor cursor = context.getContentResolver().query(
                Uri.parse("content://sms/inbox"),
                new String[]{"_id", "address", "body", "date"},
                selection,
                selectionArgs,
                "date DESC LIMIT 1"
        )) {
            if (cursor == null || !cursor.moveToFirst()) {
                return "{\"ok\":true,\"message\":null}";
            }

            String address = cursor.getString(cursor.getColumnIndexOrThrow("address"));
            String body = cursor.getString(cursor.getColumnIndexOrThrow("body"));
            long date = cursor.getLong(cursor.getColumnIndexOrThrow("date"));
            return "{\"ok\":true,\"message\":{\"from\":\"" + escapeJson(address)
                    + "\",\"body\":\"" + escapeJson(body)
                    + "\",\"date\":" + date + "}}";
        } catch (Exception error) {
            Log.e(TAG, "Inbox query failed", error);
            return "{\"ok\":false,\"error\":\"inbox_query_failed\"}";
        }
    }

    private Map<String, String> readHeaders(BufferedReader reader) throws IOException {
        Map<String, String> headers = new HashMap<>();
        String line;
        while ((line = reader.readLine()) != null && !line.isEmpty()) {
            int colon = line.indexOf(':');
            if (colon > 0) {
                String name = line.substring(0, colon).trim().toLowerCase(Locale.US);
                String value = line.substring(colon + 1).trim();
                headers.put(name, value);
            }
        }
        return headers;
    }

    private String readBody(BufferedReader reader, int contentLength) throws IOException {
        if (contentLength <= 0) {
            return "";
        }

        char[] body = new char[contentLength];
        int offset = 0;
        while (offset < contentLength) {
            int read = reader.read(body, offset, contentLength - offset);
            if (read < 0) {
                break;
            }
            offset += read;
        }
        return new String(body, 0, offset);
    }

    private int parseInt(String value) {
        if (value == null) {
            return 0;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ignored) {
            return 0;
        }
    }

    private String jsonString(String json, String key) {
        String needle = "\"" + key + "\"";
        int keyIndex = json.indexOf(needle);
        if (keyIndex < 0) {
            return null;
        }

        int colon = json.indexOf(':', keyIndex + needle.length());
        int quoteStart = json.indexOf('"', colon + 1);
        if (colon < 0 || quoteStart < 0) {
            return null;
        }

        StringBuilder value = new StringBuilder();
        boolean escaped = false;
        for (int index = quoteStart + 1; index < json.length(); index++) {
            char current = json.charAt(index);
            if (escaped) {
                value.append(current);
                escaped = false;
                continue;
            }
            if (current == '\\') {
                escaped = true;
                continue;
            }
            if (current == '"') {
                return value.toString();
            }
            value.append(current);
        }
        return null;
    }

    private String queryValue(String requestLine, String key) {
        int queryStart = requestLine.indexOf('?');
        int pathEnd = requestLine.indexOf(' ', queryStart);
        if (queryStart < 0 || pathEnd < 0) {
            return null;
        }

        String[] pairs = requestLine.substring(queryStart + 1, pathEnd).split("&");
        for (String pair : pairs) {
            int equals = pair.indexOf('=');
            if (equals <= 0) {
                continue;
            }
            String name = decode(pair.substring(0, equals));
            if (key.equals(name)) {
                return decode(pair.substring(equals + 1));
            }
        }
        return null;
    }

    private String decode(String value) {
        try {
            return URLDecoder.decode(value, StandardCharsets.UTF_8.name());
        } catch (Exception ignored) {
            return value;
        }
    }

    private String digitsOnly(String value) {
        if (value == null) {
            return null;
        }
        StringBuilder digits = new StringBuilder();
        for (int index = 0; index < value.length(); index++) {
            char current = value.charAt(index);
            if (current >= '0' && current <= '9') {
                digits.append(current);
            }
        }
        return digits.toString();
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "\\r")
                .replace("\n", "\\n");
    }

    private void writeJson(BufferedWriter writer, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        writer.write("HTTP/1.1 " + status + " " + statusText(status) + "\r\n");
        writer.write("Content-Type: application/json; charset=utf-8\r\n");
        writer.write("Content-Length: " + bytes.length + "\r\n");
        writer.write("Connection: close\r\n");
        writer.write("\r\n");
        writer.write(json);
        writer.flush();
    }

    private String statusText(int status) {
        switch (status) {
            case 200:
                return "OK";
            case 400:
                return "Bad Request";
            case 401:
                return "Unauthorized";
            case 404:
                return "Not Found";
            case 429:
                return "Too Many Requests";
            default:
                return "Error";
        }
    }
}
