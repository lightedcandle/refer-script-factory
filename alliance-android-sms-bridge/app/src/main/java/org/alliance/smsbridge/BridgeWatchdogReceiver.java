package org.alliance.smsbridge;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

public class BridgeWatchdogReceiver extends BroadcastReceiver {
    private static final String TAG = "AllianceSmsBridge";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !BridgeConfig.ACTION_WATCHDOG.equals(intent.getAction())) {
            return;
        }

        if (!BridgeConfig.enabled(context)) {
            BridgeConfig.cancelWatchdog(context);
            return;
        }

        BridgeConfig.scheduleWatchdog(context);
        Intent serviceIntent = new Intent(context, SmsBridgeService.class);
        serviceIntent.setAction(BridgeConfig.ACTION_START);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent);
            } else {
                context.startService(serviceIntent);
            }
            Log.i(TAG, "Bridge watchdog relaunched the service");
        } catch (Exception error) {
            Log.e(TAG, "Bridge watchdog failed to restart service", error);
        }
    }
}
