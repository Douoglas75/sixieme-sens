import { useState, useEffect, useCallback } from 'react';

export const useBluetoothPermissions = () => {
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);

  const checkAndRequest = useCallback(() => {
    const bridge = (window as any).AndroidBridge;
    if (bridge) {
      try {
        // Check current permissions state
        const granted = typeof bridge.checkBluetoothPermissions === 'function' 
          ? bridge.checkBluetoothPermissions() 
          : bridge.checkLocationPermission();

        setHasPermissions(!!granted);

        if (!granted) {
          console.log('[useBluetoothPermissions] Permissions not granted, requesting...');
          if (typeof bridge.requestBluetoothPermissions === 'function') {
            bridge.requestBluetoothPermissions();
          } else if (typeof bridge.startBluetoothScan === 'function') {
            // Fallback: initiating Bluetooth Scan triggers standard checkPermissions in MainActivity.java too
            bridge.startBluetoothScan();
          }
        } else {
          console.log('[useBluetoothPermissions] Bluetooth and location permissions are already granted');
        }
      } catch (e) {
        console.error('[useBluetoothPermissions] Error checking or requesting permissions', e);
      }
    } else {
      // Not Android APK
      setHasPermissions(true);
    }
  }, []);

  useEffect(() => {
    // Run automatically on mount
    checkAndRequest();
  }, [checkAndRequest]);

  return {
    hasPermissions,
    checkAndRequest
  };
};
