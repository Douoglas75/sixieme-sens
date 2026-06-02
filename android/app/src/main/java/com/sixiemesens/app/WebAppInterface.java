package com.sixiemesens.app;

import android.webkit.JavascriptInterface;

public class WebAppInterface {
    private BluetoothModule bluetoothModule;

    public WebAppInterface(BluetoothModule bluetoothModule) {
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
}
