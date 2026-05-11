package org.alliance.smsbridge;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.net.Uri;
import android.text.InputType;
import android.text.method.ScrollingMovementMethod;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.provider.Settings;
import android.os.PowerManager;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Collections;

public class MainActivity extends Activity {
    private final Handler handler = new Handler(Looper.getMainLooper());
    private Button removeSelfPhoneButton;
    private Button startButton;
    private Button stopButton;
    private Button batteryOptimizationButton;
    private TextView bridgeStateView;
    private TextView statusView;
    private TextView savedBridgeNumberView;
    private final Runnable refreshUi = new Runnable() {
        @Override
        public void run() {
            updateUiState();
            handler.postDelayed(this, 2000);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestNeededPermissions();

        ScrollView scroll = new ScrollView(this);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(32, 36, 32, 32);
        scroll.addView(root, new ScrollView.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        ImageView logo = new ImageView(this);
        logo.setImageResource(getResources().getIdentifier("alliance_icon", "drawable", getPackageName()));
        logo.setAdjustViewBounds(true);
        LinearLayout.LayoutParams logoParams = new LinearLayout.LayoutParams(220, 220);
        logoParams.setMargins(0, 0, 0, 18);
        root.addView(logo, logoParams);

        TextView title = new TextView(this);
        title.setText("Alliance SMS Bridge");
        title.setTextSize(24);
        root.addView(title, fullWidth());

        bridgeStateView = new TextView(this);
        bridgeStateView.setTextSize(18);
        bridgeStateView.setPadding(0, 10, 0, 10);
        root.addView(bridgeStateView, fullWidth());

        statusView = new TextView(this);
        statusView.setTextSize(15);
        statusView.setMovementMethod(new ScrollingMovementMethod());
        root.addView(statusView, fullWidth());

        TextView selfPhoneLabel = new TextView(this);
        selfPhoneLabel.setText("Bridge phone number");
        root.addView(selfPhoneLabel, fullWidth());

        savedBridgeNumberView = new TextView(this);
        savedBridgeNumberView.setTextSize(15);
        updateSavedBridgeNumberView();
        root.addView(savedBridgeNumberView, fullWidth());

        EditText selfPhone = new EditText(this);
        selfPhone.setBackground(inputBackground());
        selfPhone.setHintTextColor(Color.rgb(120, 120, 120));
        selfPhone.setInputType(InputType.TYPE_CLASS_PHONE);
        selfPhone.setPadding(24, 16, 24, 16);
        selfPhone.setSingleLine(true);
        selfPhone.setHint("Enter bridge phone number");
        LinearLayout.LayoutParams inputParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        inputParams.setMargins(0, 10, 0, 10);
        root.addView(selfPhone, inputParams);

        Button saveSelfPhone = new Button(this);
        saveSelfPhone.setText("Save / Update Bridge Number");
        saveSelfPhone.setOnClickListener(view -> {
            BridgeConfig.setSelfPhone(this, selfPhone.getText().toString());
            selfPhone.setText("");
            updateUiState();
        });
        root.addView(saveSelfPhone, fullWidth());

        removeSelfPhoneButton = new Button(this);
        removeSelfPhoneButton.setText("Remove Bridge Number");
        removeSelfPhoneButton.setOnClickListener(view -> {
            BridgeConfig.setSelfPhone(this, "");
            selfPhone.setText("");
            updateUiState();
        });
        root.addView(removeSelfPhoneButton, fullWidth());

        startButton = new Button(this);
        startButton.setText("Start Bridge");
        startButton.setOnClickListener(view -> {
            requestBatteryOptimizationExemption();
            sendServiceAction(BridgeConfig.ACTION_START);
            BridgeConfig.setEnabled(this, true);
            updateUiState();
        });
        root.addView(startButton, fullWidth());

        stopButton = new Button(this);
        stopButton.setText("Stop Bridge");
        stopButton.setOnClickListener(view -> {
            sendServiceAction(BridgeConfig.ACTION_STOP);
            BridgeConfig.setEnabled(this, false);
            updateUiState();
        });
        root.addView(stopButton, fullWidth());

        batteryOptimizationButton = new Button(this);
        batteryOptimizationButton.setText("Keep Bridge Always On");
        batteryOptimizationButton.setOnClickListener(view -> requestBatteryOptimizationExemption());
        root.addView(batteryOptimizationButton, fullWidth());

        Button close = new Button(this);
        close.setText("Close");
        close.setOnClickListener(view -> moveTaskToBack(true));
        root.addView(close, fullWidth());

        setContentView(scroll);
        updateUiState();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (BridgeConfig.enabled(this)) {
            sendServiceAction(BridgeConfig.ACTION_START);
        }
        updateUiState();
        handler.postDelayed(refreshUi, 2000);
    }

    @Override
    protected void onPause() {
        handler.removeCallbacks(refreshUi);
        super.onPause();
    }

    private void requestNeededPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestPermissions(new String[]{Manifest.permission.SEND_SMS, Manifest.permission.READ_SMS, Manifest.permission.POST_NOTIFICATIONS}, 10);
            return;
        }
        if (checkSelfPermission(Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED
                || checkSelfPermission(Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.SEND_SMS, Manifest.permission.READ_SMS}, 10);
        }
    }

    private void sendServiceAction(String action) {
        Intent intent = new Intent(this, SmsBridgeService.class);
        intent.setAction(action);
        if (BridgeConfig.ACTION_STOP.equals(action)) {
            stopService(intent);
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent);
        } else {
            startService(intent);
        }
    }

    private ViewGroup.LayoutParams fullWidth() {
        return new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
    }

    private GradientDrawable inputBackground() {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(Color.WHITE);
        drawable.setStroke(2, Color.rgb(90, 90, 90));
        drawable.setCornerRadius(8);
        return drawable;
    }

    private void updateSavedBridgeNumberView() {
        String value = BridgeConfig.selfPhone(this);
        if (value == null || value.isEmpty()) {
            savedBridgeNumberView.setText("Saved bridge number: none");
            return;
        }
        savedBridgeNumberView.setText("Saved bridge number: " + maskPhone(value));
    }

    private void updateUiState() {
        boolean running = BridgeConfig.running(this);
        boolean enabled = BridgeConfig.enabled(this);
        boolean cloud = BridgeConfig.cloudEnabled(this);
        String bridgeNumber = BridgeConfig.selfPhone(this);
        boolean hasBridgeNumber = bridgeNumber != null && !bridgeNumber.isEmpty();

        String stateText = running ? "● Bridge Running" : enabled ? "● Bridge Starting" : "● Bridge Off";
        bridgeStateView.setText(stateText + (recentActivity() ? "  • receiving" : ""));
        bridgeStateView.setTextColor(running ? Color.rgb(0, 130, 60) : enabled ? Color.rgb(140, 110, 0) : Color.rgb(145, 50, 50));

        statusView.setText(joinLines(new String[]{
                "Local API: http://" + localIp() + ":" + BridgeConfig.PORT,
                "Cloud relay: " + (cloud ? "on" : "off"),
                "Loop filter: " + (hasBridgeNumber ? "bridge number " + maskPhone(bridgeNumber) : "set bridge number"),
                "Battery: " + (ignoringBatteryOptimizations() ? "unrestricted" : "restricted"),
                "Last inbound: " + formatTime(BridgeConfig.lastInboundAt(this)),
                "Last outbound: " + formatTime(BridgeConfig.lastOutboundAt(this))
        }));

        updateSavedBridgeNumberView();
        removeSelfPhoneButton.setVisibility(hasBridgeNumber ? View.VISIBLE : View.GONE);
        startButton.setVisibility(running ? View.GONE : View.VISIBLE);
        stopButton.setVisibility(running ? View.VISIBLE : View.GONE);
        batteryOptimizationButton.setText(ignoringBatteryOptimizations() ? "Battery Restriction Already Disabled" : "Keep Bridge Always On");
        batteryOptimizationButton.setEnabled(!ignoringBatteryOptimizations());
    }

    private boolean recentActivity() {
        long latest = Math.max(BridgeConfig.lastInboundAt(this), BridgeConfig.lastOutboundAt(this));
        return latest > 0 && Math.abs(System.currentTimeMillis() - latest) < 30_000L;
    }

    private String formatTime(long millis) {
        if (millis <= 0) return "none";
        long ageSeconds = Math.max(0, (System.currentTimeMillis() - millis) / 1000L);
        if (ageSeconds < 60) return ageSeconds + "s ago";
        long ageMinutes = ageSeconds / 60L;
        if (ageMinutes < 60) return ageMinutes + "m ago";
        return (ageMinutes / 60L) + "h ago";
    }

    private String joinLines(String[] values) {
        StringBuilder builder = new StringBuilder();
        for (int index = 0; index < values.length; index++) {
            if (index > 0) builder.append("\n");
            builder.append(values[index]);
        }
        return builder.toString();
    }

    private String maskPhone(String value) {
        String digits = BridgeConfig.onlyDigits(value);
        if (digits.length() <= 4) return digits;
        return "***" + digits.substring(digits.length() - 4);
    }

    private boolean ignoringBatteryOptimizations() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return true;
        }
        PowerManager powerManager = getSystemService(PowerManager.class);
        return powerManager != null && powerManager.isIgnoringBatteryOptimizations(getPackageName());
    }

    private void requestBatteryOptimizationExemption() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return;
        }
        if (ignoringBatteryOptimizations()) {
            return;
        }
        Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
        intent.setData(Uri.parse("package:" + getPackageName()));
        startActivity(intent);
    }

    private String localIp() {
        try {
            for (NetworkInterface networkInterface : Collections.list(NetworkInterface.getNetworkInterfaces())) {
                for (InetAddress address : Collections.list(networkInterface.getInetAddresses())) {
                    if (!address.isLoopbackAddress() && address instanceof Inet4Address) {
                        return address.getHostAddress();
                    }
                }
            }
        } catch (Exception ignored) {
        }
        return "PHONE_LAN_IP";
    }
}
