import { useEffect } from 'react';

export const useBackgroundTasks = () => {
  useEffect(() => {
    const registerBackgroundTasks = async () => {
      if (!('serviceWorker' in navigator)) return;

      try {
        const registration = await navigator.serviceWorker.ready;

        // 1. Request Notification Permission (needed for background feedback)
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }

        // 2. Register Background Sync
        if ('sync' in registration) {
          try {
            // @ts-ignore - Background Sync API
            await registration.sync.register('sync-data');
            console.log('[Background] Sync registered');
          } catch (err) {
            console.warn('[Background] Sync registration failed:', err);
          }
        }

        // 3. Register Periodic Background Sync
        // Note: This requires the app to be installed and have sufficient engagement
        if ('periodicSync' in registration) {
          try {
            const status = await navigator.permissions.query({
              // @ts-ignore - Periodic Sync API
              name: 'periodic-background-sync',
            });

            if (status.state === 'granted') {
              // @ts-ignore - Periodic Sync API
              await registration.periodicSync.register('intelligence-update', {
                minInterval: 24 * 60 * 60 * 1000, // Once a day
              });
              console.log('[Background] Periodic Sync registered');
            } else {
              console.log('[Background] Periodic Sync permission not granted');
            }
          } catch (err) {
            console.warn('[Background] Periodic Sync registration failed:', err);
          }
        }
      } catch (err) {
        console.error('[Background] Error during registration:', err);
      }
    };

    registerBackgroundTasks();
  }, []);
};
