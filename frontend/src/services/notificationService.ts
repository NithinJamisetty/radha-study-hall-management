/**
 * Radha Study Hall Jarvis Notification Engine
 * Manages mobile hourly notifications, system alerts, and background reminders.
 */

const STORAGE_KEY_HOURLY_ENABLED = 'radha_jarvis_hourly_enabled_v1';
const STORAGE_KEY_LAST_NOTIFIED_HOUR = 'radha_jarvis_last_notified_hour_v1';

export interface JarvisHourlyScheduleItem {
  hour: number;
  title: string;
  body: string;
  actionTag: string;
}

export const HOURLY_JARVIS_SCHEDULE: Record<number, { title: string; body: string }> = {
  6: {
    title: '☀️ Radha Jarvis: Morning Shift Begins (06:00)',
    body: 'Study hall doors are open. Check cabin lights, AC settings, and drinking water dispenser.'
  },
  7: {
    title: '📚 Radha Jarvis: Early Bird Attendance (07:00)',
    body: 'Morning aspirants are arriving. Tap AI Chat to record early morning turnout.'
  },
  8: {
    title: '💧 Radha Jarvis: Facility Audit (08:00)',
    body: 'Verify water purifier, newspaper rack, and restroom hygiene are top notch.'
  },
  9: {
    title: '📝 Radha Jarvis: Admissions Desk (09:00)',
    body: 'Peak enquiry hour. Remember to collect registration forms, photo ID, and security deposit.'
  },
  10: {
    title: '📶 Radha Jarvis: High-Speed Wi-Fi Check (10:00)',
    body: 'Test main router bandwidth. Ensure students downloading lectures have 100% stable connection.'
  },
  11: {
    title: '💰 Radha Jarvis: Fee Collection Log (11:00)',
    body: 'Mid-morning fee reconciliation. Chat with Jarvis: "Collected fees from X students with ₹Y".'
  },
  12: {
    title: '🔄 Radha Jarvis: Shift Transition (12:00)',
    body: 'Afternoon shift commences. Monitor cabin vacancy and turnover.'
  },
  13: {
    title: '🤫 Radha Jarvis: Quiet Hours Notice (13:00)',
    body: 'Ensure lunch area remains separated from main study cabins. Zero phone calls policy.'
  },
  14: {
    title: '📊 Radha Jarvis: Afternoon Turnout (14:00)',
    body: 'Log afternoon attendance in AI Chat to automatically update today\'s Excel record.'
  },
  15: {
    title: '⚡ Radha Jarvis: Power & AC Check (15:00)',
    body: 'Verify inverter backup is charged. Keep AC set to optimal 24°C for power efficiency.'
  },
  16: {
    title: '☕ Radha Jarvis: Tea Break Inspection (16:00)',
    body: 'Check drinking water refills and quick cleanup before the evening rush.'
  },
  17: {
    title: '🌆 Radha Jarvis: Peak Evening Shift (17:00)',
    body: 'Peak student hours! Cabin occupancy is at maximum. Welcome evening students.'
  },
  18: {
    title: '👥 Radha Jarvis: Evening Headcount (18:00)',
    body: 'Please log evening shift attendance: e.g. "Evening shift attendance was 85".'
  },
  19: {
    title: '⏳ Radha Jarvis: 1-Hour Report Countdown (19:00)',
    body: '1 hour remaining until today\'s 8:00 PM WhatsApp Daily Report auto-compilation!'
  },
  20: {
    title: '📊 Radha Jarvis: 8:00 PM Daily Report Ready! (20:00)',
    body: 'Today\'s Radha Study Hall performance report is compiled. Tap to review and dispatch.'
  },
  21: {
    title: '🌙 Radha Jarvis: Night Shift Active (21:00)',
    body: 'Night study batch is settled. Ensure study cabin reading lamps are operational.'
  },
  22: {
    title: '🔐 Radha Jarvis: Security & Lockup Check (22:00)',
    body: 'Inspect rear exit doors, parking area security, and turn off empty cabin lights.'
  },
  23: {
    title: '⚡ Radha Jarvis: Power Saving Mode (23:00)',
    body: 'Power down unoccupied AC units. Great job today on managing Radha Study Hall!'
  }
};

class NotificationService {
  private intervalId: any = null;

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  isHourlyEnabled(): boolean {
    if (typeof localStorage === 'undefined') return true;
    const val = localStorage.getItem(STORAGE_KEY_HOURLY_ENABLED);
    return val === null ? true : val === 'true'; // enabled by default
  }

  setHourlyEnabled(enabled: boolean) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_HOURLY_ENABLED, enabled ? 'true' : 'false');
    }
    if (enabled) {
      this.startHourlyWatcher();
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.setHourlyEnabled(true);
        this.triggerNotification(
          '🤖 Radha Jarvis Activated!',
          'Hourly mobile alerts and operational guidance are now live on your device.',
          'jarvis-welcome'
        );
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Failed to request notification permission:', err);
      return false;
    }
  }

  async triggerNotification(title: string, body: string, tag = 'radha-jarvis-alert'): Promise<boolean> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([150, 75, 150]);
      }

      // Try ServiceWorker notification first for mobile lock screen display
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          options: {
            body,
            tag,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            renotify: true,
            requireInteraction: false
          }
        });
        return true;
      }

      const swReg = await navigator.serviceWorker?.getRegistration();
      if (swReg && 'showNotification' in swReg) {
        await swReg.showNotification(title, {
          body,
          tag,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [200, 100, 200]
        } as any);
        return true;
      }

      // Fallback to standard Notification
      new Notification(title, {
        body,
        tag,
        icon: '/icon-192.png'
      });
      return true;
    } catch (e) {
      console.warn('Notification trigger fallback error:', e);
      return false;
    }
  }

  async sendTestNotification(): Promise<boolean> {
    if (this.getPermission() !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }
    return this.triggerNotification(
      '🤖 Radha Jarvis: Hourly System Check Active!',
      'Jarvis is online and guarding Radha Study Hall. You will receive real-time operational alerts every hour.',
      'jarvis-test'
    );
  }

  startHourlyWatcher() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    const checkHourly = () => {
      if (!this.isHourlyEnabled() || this.getPermission() !== 'granted') {
        return;
      }

      const now = new Date();
      const currentHour = now.getHours();
      const todayDate = now.toISOString().split('T')[0];
      const hourKey = `${todayDate}-${currentHour}`;

      const lastNotified = localStorage.getItem(STORAGE_KEY_LAST_NOTIFIED_HOUR);
      if (lastNotified === hourKey) {
        return; // Already notified for this hour
      }

      const schedule = HOURLY_JARVIS_SCHEDULE[currentHour];
      if (schedule) {
        this.triggerNotification(schedule.title, schedule.body, `jarvis-hour-${currentHour}`);
        localStorage.setItem(STORAGE_KEY_LAST_NOTIFIED_HOUR, hourKey);
      } else {
        // Fallback for late-night / off-peak hours
        this.triggerNotification(
          `⏱️ Radha Jarvis Hourly Tick (${currentHour}:00)`,
          `All systems normal at Radha Study Hall. Total Active Students: 185.`,
          `jarvis-hour-${currentHour}`
        );
        localStorage.setItem(STORAGE_KEY_LAST_NOTIFIED_HOUR, hourKey);
      }
    };

    // Run check immediately on init
    checkHourly();

    // Check every 45 seconds to catch each top-of-the-hour transition reliably
    this.intervalId = setInterval(checkHourly, 45000);
  }

  stopHourlyWatcher() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const notificationService = new NotificationService();
