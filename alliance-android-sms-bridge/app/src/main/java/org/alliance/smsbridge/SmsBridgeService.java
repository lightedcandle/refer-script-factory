package org.alliance.smsbridge;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;

public class SmsBridgeService extends Service {
    private static final String TAG = "AllianceSmsBridge";
    private static final String CHANNEL_ID = "alliance_sms_bridge";
    private static final int NOTIFICATION_ID = 8787;

    private BridgeHttpServer server;
    private CloudRelay cloudRelay;
    private PowerManager.WakeLock wakeLock;

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
            return;
        }

        try {
            server = new BridgeHttpServer(this, BridgeConfig.token(this));
            server.start();
            cloudRelay = new CloudRelay(this);
            cloudRelay.start();
            Log.i(TAG, "Bridge started on port " + BridgeConfig.PORT);
        } catch (Exception error) {
            Log.e(TAG, "Bridge failed to start", error);
            stopSelf();
        }
    }

    private void stopBridge() {
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
