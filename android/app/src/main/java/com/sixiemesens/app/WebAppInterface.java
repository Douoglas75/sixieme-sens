package com.sixiemesens.app;

import android.webkit.JavascriptInterface;

public class WebAppInterface {
    private MainActivity mainActivity;
    private BluetoothModule bluetoothModule;

    public WebAppInterface(MainActivity mainActivity, BluetoothModule bluetoothModule) {
        this.mainActivity = mainActivity;
        this.bluetoothModule = bluetoothModule;
    }

    @JavascriptInterface
    public void startBluetoothScan() {
        bluetoothModule.startScan();
    }

    @JavascriptInterface
    public void stopBluetoothScan() {
        bluetoothModule.stopScan();
    }

    @JavascriptInterface
    public void connectToDevice(String address) {
        bluetoothModule.connect(address);
    }

    @JavascriptInterface
    public void disconnectDevice() {
        bluetoothModule.disconnect();
    }

    @JavascriptInterface
    public void openAppSettings() {
        mainActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mainActivity.openAppSettings();
            }
        });
    }

    @JavascriptInterface
    public boolean checkLocationPermission() {
        return mainActivity.hasLocationPermission();
    }
}
