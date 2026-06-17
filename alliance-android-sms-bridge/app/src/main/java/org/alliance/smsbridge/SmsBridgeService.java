package org.alliance.smsbridge;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.util.Log;

public class SmsBridgeService extends Service {
    private static final String TAG = "AllianceSmsBridge";
    private static final String CHANNEL_ID = "alliance_sms_bridge";
    private static final int NOTIFICATION_ID = 8787;
    private static final long HEALTH_CHECK_INTERVAL_MS = 60_000L;

    private BridgeHttpServer server;
    private CloudRelay cloudRelay;
    private PowerManager.WakeLock wakeLock;
    private final Handler healthHandler = new Handler(Looper.getMainLooper());
    private final Runnable healthCheck = new Runnable() {
        @Override
        public void run() {
            if (!BridgeConfig.enabled(SmsBridgeService.this)) {
                return;
            }

            boolean serverAlive = server != null && server.isAlive();
            boolean relayAlive = cloudRelay != null && cloudRelay.isAlive();
            if (!serverAlive || !relayAlive) {
                Log.w(TAG, "Bridge watchdog detected a dead component; restarting service");
                restartBridge();
                return;
            }

            BridgeConfig.scheduleWatchdog(SmsBridgeService.this);
            healthHandler.postDelayed(this, HEALTH_CHECK_INTERVAL_MS);
        }
    };

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent == null ? BridgeConfig.ACTION_START : intent.getAction();
        if (BridgeConfig.ACTION_STOP.equals(action)) {
            BridgeConfig.setEnabled(this, false);
            stopBridge();
            stopSelf();
            return START_NOT_STICKY;
        }

        BridgeConfig.setEnabled(this, true);
        startBridge();
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        stopBridge();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void startBridge() {
        createChannel();
        startForeground(NOTIFICATION_ID, notification());
        BridgeConfig.setRunning(this, true);
        acquireWakeLock();
        if (server != null) {
            ensureCloudRelay();
            BridgeConfig.scheduleWatchdog(this);
            startHealthChecks();
            return;
        }

        try {
            server = new BridgeHttpServer(this, BridgeConfig.token(this));
            server.start();
            ensureCloudRelay();
            BridgeConfig.scheduleWatchdog(this);
            startHealthChecks();
            Log.i(TAG, "Bridge started on port " + BridgeConfig.PORT);
        } catch (Exception error) {
            Log.e(TAG, "Bridge failed to start", error);
            stopSelf();
        }
    }

    private void ensureCloudRelay() {
        if (cloudRelay == null) {
            cloudRelay = new CloudRelay(this);
        }
        if (!cloudRelay.isAlive()) {
            cloudRelay.start();
        }
    }

    private void startHealthChecks() {
        healthHandler.removeCallbacks(healthCheck);
        healthHandler.postDelayed(healthCheck, HEALTH_CHECK_INTERVAL_MS);
    }

    private void restartBridge() {
        healthHandler.removeCallbacks(healthCheck);
        BridgeConfig.cancelWatchdog(this);
        stopBridge();
        if (BridgeConfig.enabled(this)) {
            startBridge();
        }
    }

    private void stopBridge() {
        healthHandler.removeCallbacks(healthCheck);
        BridgeConfig.cancelWatchdog(this);
        if (server != null) {
            server.stop();
            server = null;
        }
        if (cloudRelay != null) {
            cloudRelay.stop();
            cloudRelay = null;
        }
        BridgeConfig.setRunning(this, false);
        releaseWakeLock();
        stopForeground(true);
    }

    private void acquireWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            return;
        }
        PowerManager powerManager = getSystemService(PowerManager.class);
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "AllianceSmsBridge::server");
        wakeLock.setReferenceCounted(false);
        wakeLock.acquire();
    }

    private void releaseWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        wakeLock = null;
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Alliance SMS Bridge",
                NotificationManager.IMPORTANCE_LOW
        );
        NotificationManager manager = getSystemService(NotificationManager.class);
        manager.createNotificationChannel(channel);
    }

    private Notification notification() {
        Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? new Notification.Builder(this, CHANNEL_ID)
                : new Notification.Builder(this);

        return builder
                .setContentTitle("Alliance SMS Bridge")
                .setContentText("SMS API bridge is running on port " + BridgeConfig.PORT)
                .setSmallIcon(android.R.drawable.stat_sys_upload)
                .build();
    }
}
