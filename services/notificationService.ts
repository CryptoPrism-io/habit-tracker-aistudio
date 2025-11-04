/**
 * Notification service for habit reminders
 */

import { Habit } from '../types';
import { formatTime, getHabitStatus, getHabitsDueNow } from '../utils/timeHelpers';

interface NotificationState {
  enabled: boolean;
  lastCheckedTime: string;
  notifiedHabits: Set<string>;
}

class NotificationService {
  private state: NotificationState = {
    enabled: false,
    lastCheckedTime: new Date().toISOString(),
    notifiedHabits: new Set(),
  };

  private checkInterval: NodeJS.Timeout | null = null;
  private requestedPermission = false;

  /**
   * Initialize notification service
   * Request browser permission for notifications
   */
  async init(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported by browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.state.enabled = true;
      return true;
    }

    if (Notification.permission !== 'denied' && !this.requestedPermission) {
      try {
        const permission = await Notification.requestPermission();
        this.requestedPermission = true;
        this.state.enabled = permission === 'granted';
        return this.state.enabled;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }

    return false;
  }

  /**
   * Start monitoring habits and send notifications
   */
  startMonitoring(habits: Habit[], checkIntervalMs: number = 60000) {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }

    // Check immediately on start
    this.checkAndNotify(habits);

    // Then check periodically (every minute by default)
    this.checkInterval = setInterval(() => {
      this.checkAndNotify(habits);
    }, checkIntervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check habits and send notifications for due habits
   */
  private checkAndNotify(habits: Habit[]) {
    if (!this.state.enabled) return;

    const dueNow = getHabitsDueNow(habits, 30);

    dueNow.forEach((habit) => {
      // Only notify once per habit per day
      if (!this.state.notifiedHabits.has(habit.id)) {
        this.sendNotification(habit);
        this.state.notifiedHabits.add(habit.id);

        // Reset notifications at midnight
        const resetTime = new Date();
        resetTime.setDate(resetTime.getDate() + 1);
        resetTime.setHours(0, 0, 0, 0);
        const timeUntilMidnight = resetTime.getTime() - new Date().getTime();

        setTimeout(() => {
          this.state.notifiedHabits.clear();
        }, timeUntilMidnight);
      }
    });
  }

  /**
   * Send a single notification for a habit
   */
  private sendNotification(habit: Habit) {
    const hour = habit.scheduledHour ?? 0;
    const minute = habit.scheduledMinute ?? 0;
    const time = formatTime(hour, minute);

    const title = "🎯 Time for a Habit!";
    const options: NotificationOptions = {
      body: `${habit.name} is scheduled for ${time}`,
      icon: '/habit-tracker-aistudio/public/icon-192x192.png',
      badge: '/habit-tracker-aistudio/public/icon-96x96.png',
      tag: `habit-${habit.id}`,
      requireInteraction: false,
      actions: [
        { action: 'complete', title: '✓ Mark Complete' },
        { action: 'dismiss', title: '✕ Dismiss' },
      ],
    };

    try {
      const notification = new Notification(title, options);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      notification.onaction = (event) => {
        if (event.action === 'complete') {
          // Dispatch custom event for app to handle
          window.dispatchEvent(
            new CustomEvent('habit:complete-from-notification', {
              detail: { habitId: habit.id },
            })
          );
        }
        notification.close();
      };
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Send immediate test notification
   */
  async sendTestNotification() {
    if (!this.state.enabled) {
      const initialized = await this.init();
      if (!initialized) {
        console.error('Failed to initialize notifications');
        return false;
      }
    }

    try {
      new Notification('🎯 Test Notification', {
        body: 'Notifications are working correctly!',
        icon: '/habit-tracker-aistudio/public/icon-192x192.png',
      });
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.state.enabled && Notification.permission === 'granted';
  }
}

// Export singleton instance
export default new NotificationService();
