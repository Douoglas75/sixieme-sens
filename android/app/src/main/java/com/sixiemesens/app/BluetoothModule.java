package com.sixiemesens.app;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.webkit.WebView;
import org.json.JSONObject;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class BluetoothModule {
    private static final String TAG = "BluetoothModule";
    private Context context;
    private WebView webView;
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothLeScanner bluetoothLeScanner;
    private BluetoothGatt bluetoothGatt;
    private boolean isScanning = false;
    private Handler handler = new Handler(Looper.getMainLooper());
    private Map<String, BluetoothDevice> discoveredDevices = new HashMap<>();

    // Common UUIDs
    private static final UUID HEART_RATE_SERVICE_UUID = UUID.fromString("0000180d-0000-1000-8000-00805f9b34fb");
    private static final UUID HEART_RATE_MEASUREMENT_CHAR_UUID = UUID.fromString("00002a37-0000-1000-8000-00805f9b34fb");

    public BluetoothModule(Context context, WebView webView) {
        this.context = context;
        this.webView = webView;
        BluetoothManager bluetoothManager = (BluetoothManager) context.getSystemService(Context.BLUETOOTH_SERVICE);
        if (bluetoothManager != null) {
            bluetoothAdapter = bluetoothManager.getAdapter();
            if (bluetoothAdapter != null) {
                bluetoothLeScanner = bluetoothAdapter.getBluetoothLeScanner();
            }
        }
    }

    public void startScan() {
        if (bluetoothLeScanner == null || isScanning) return;

        discoveredDevices.clear();
        isScanning = true;
        bluetoothLeScanner.startScan(scanCallback);
        Log.d(TAG, "Scan started");
        
        handler.postDelayed(this::stopScan, 15000);
    }

    public void stopScan() {
        if (bluetoothLeScanner == null || !isScanning) return;
        isScanning = false;
        bluetoothLeScanner.stopScan(scanCallback);
        Log.d(TAG, "Scan stopped");
        sendToJS("onScanFinished", null);
    }

    public void connect(String address) {
        BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);
        if (device == null) return;

        Log.d(TAG, "Connecting to " + address);
        bluetoothGatt = device.connectGatt(context, false, gattCallback);
    }

    public void disconnect() {
        if (bluetoothGatt != null) {
            bluetoothGatt.disconnect();
        }
    }

    private final ScanCallback scanCallback = new ScanCallback() {
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            BluetoothDevice device = result.getDevice();
            if (device != null && !discoveredDevices.containsKey(device.getAddress())) {
                String name = device.getName();
                
                // Try to get name from scan record if device name is null
                if (name == null && result.getScanRecord() != null) {
                    name = result.getScanRecord().getDeviceName();
                }

                // Filter out devices with no name to avoid "Appareil Inconnu" clutter
                if (name == null || name.isEmpty() || name.equals("Appareil Inconnu")) {
                    return;
                }

                discoveredDevices.put(device.getAddress(), device);
                try {
                    JSONObject deviceJson = new JSONObject();
                    deviceJson.put("id", device.getAddress());
                    deviceJson.put("name", name);
                    deviceJson.put("rssi", result.getRssi());
                    sendToJS("onDeviceFound", deviceJson);
                } catch (Exception e) {
                    Log.e(TAG, "Error creating device JSON", e);
                }
            }
        }
    };

    private final BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            try {
                JSONObject statusJson = new JSONObject();
                statusJson.put("address", gatt.getDevice().getAddress());
                if (newState == BluetoothProfile.STATE_CONNECTED) {
                    Log.d(TAG, "Connected to GATT server.");
                    statusJson.put("status", "connected");
                    gatt.discoverServices();
                } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                    Log.d(TAG, "Disconnected from GATT server.");
                    statusJson.put("status", "disconnected");
                }
                sendToJS("onConnectionStateChange", statusJson);
            } catch (Exception e) {
                Log.e(TAG, "Error in onConnectionStateChange", e);
            }
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                Log.d(TAG, "Services discovered");
                // Enable notifications for Heart Rate if available
                BluetoothGattService hrService = gatt.getService(HEART_RATE_SERVICE_UUID);
                if (hrService != null) {
                    BluetoothGattCharacteristic hrChar = hrService.getCharacteristic(HEART_RATE_MEASUREMENT_CHAR_UUID);
                    if (hrChar != null) {
                        gatt.setCharacteristicNotification(hrChar, true);
                    }
                }
            }
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
            if (HEART_RATE_MEASUREMENT_CHAR_UUID.equals(characteristic.getUuid())) {
                int flag = characteristic.getProperties();
                int format = -1;
                if ((flag & 0x01) != 0) {
                    format = BluetoothGattCharacteristic.FORMAT_UINT16;
                } else {
                    format = BluetoothGattCharacteristic.FORMAT_UINT8;
                }
                final int heartRate = characteristic.getIntValue(format, 1);
                try {
                    JSONObject dataJson = new JSONObject();
                    dataJson.put("type", "heart_rate");
                    dataJson.put("value", heartRate);
                    dataJson.put("source", gatt.getDevice().getName());
                    sendToJS("onDataReceived", dataJson);
                } catch (Exception e) {
                    Log.e(TAG, "Error in onCharacteristicChanged", e);
                }
            }
        }
    };

    private void sendToJS(final String methodName, final JSONObject data) {
        handler.post(() -> {
            String js;
            if (data != null) {
                js = "javascript:window.dispatchEvent(new CustomEvent('" + methodName + "', { detail: " + data.toString() + " }));";
            } else {
                js = "javascript:window.dispatchEvent(new CustomEvent('" + methodName + "'));";
            }
            webView.evaluateJavascript(js, null);
        });
    }
}
