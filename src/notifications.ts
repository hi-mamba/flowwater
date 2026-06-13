import { LocalNotifications, type ScheduleOptions } from '@capacitor/local-notifications';

let initialized = false;

/** Initialize native notifications. Returns true if available and permitted. */
export async function initNotifications(): Promise<boolean> {
  if (initialized) return true;

  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') {
      const { display: newDisplay } = await LocalNotifications.requestPermissions();
      if (newDisplay !== 'granted') return false;
    }
    initialized = true;
    return true;
  } catch {
    // Plugin not available (e.g. running in browser dev mode)
    console.warn('[Notifications] Capacitor LocalNotifications not available, using fallback');
    return false;
  }
}

/** Send a drink reminder notification. Falls back to Web Notification if native unavailable. */
export async function sendDrinkReminder(): Promise<void> {
  try {
    const options: ScheduleOptions = {
      notifications: [
        {
          id: 1,
          title: '悦泉提醒 💧',
          body: '老板没看到你，快喝口水摸个鱼！',
          schedule: { at: new Date(Date.now() + 1000) },
          smallIcon: 'ic_launcher',
        },
      ],
    };
    await LocalNotifications.schedule(options);
  } catch {
    // Fallback: Web Notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('悦泉提醒 💧', {
        body: '老板没看到你，快喝口水摸个鱼！',
        icon: '/vite.svg',
      });
    }
  }
}

/** Check if notification permission is granted. */
export async function checkNotificationPermission(): Promise<boolean> {
  try {
    const { display } = await LocalNotifications.checkPermissions();
    return display === 'granted';
  } catch {
    return 'Notification' in window && Notification.permission === 'granted';
  }
}

/** Request notification permission. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  } catch {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
    return false;
  }
}
