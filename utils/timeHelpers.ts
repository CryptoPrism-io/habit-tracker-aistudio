/**
 * Time helper functions for habit scheduling
 */

export function formatTime(hour: number, minute: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

export function formatTime24h(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export function getMinutesUntilTime(hour: number, minute: number): number {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const scheduled = hour * 60 + minute;

  let diff = scheduled - current;

  if (diff < 0) {
    // Time has passed, calculate for tomorrow
    diff += 24 * 60;
  }

  return diff;
}

export function getHabitStatus(
  hour: number,
  minute: number,
  windowMinutes: number = 30
): 'now' | 'upcoming' | 'overdue' {
  const minutesUntil = getMinutesUntilTime(hour, minute);
  const minutesSince = 24 * 60 - minutesUntil; // Minutes since it was due yesterday

  // Due now: within windowMinutes before or after scheduled time
  if (minutesUntil <= windowMinutes && minutesSince <= windowMinutes) {
    return 'now';
  }

  // Overdue: if it's been more than windowMinutes since the time passed (within same day)
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const scheduled = hour * 60 + minute;

  if (current > scheduled && current - scheduled > windowMinutes) {
    return 'overdue';
  }

  return 'upcoming';
}

export function getStatusColor(status: 'now' | 'upcoming' | 'overdue'): string {
  switch (status) {
    case 'now':
      return '#ffc107'; // Amber/Yellow
    case 'upcoming':
      return '#4caf50'; // Green
    case 'overdue':
      return '#ff6b6b'; // Red
    default:
      return '#888';
  }
}

export function getStatusLabel(status: 'now' | 'upcoming' | 'overdue'): string {
  switch (status) {
    case 'now':
      return 'Due Now';
    case 'upcoming':
      return 'Upcoming';
    case 'overdue':
      return 'Overdue';
    default:
      return 'Scheduled';
  }
}

/**
 * Sort habits by scheduled time
 * Priority: overdue > now > upcoming
 */
export function sortHabitsByTime(
  habits: Array<{ scheduledHour?: number; scheduledMinute?: number }>,
  prioritizeNow: boolean = true
) {
  return [...habits].sort((a, b) => {
    const aHour = a.scheduledHour ?? 0;
    const aMinute = a.scheduledMinute ?? 0;
    const bHour = b.scheduledHour ?? 0;
    const bMinute = b.scheduledMinute ?? 0;

    if (prioritizeNow) {
      const aStatus = getHabitStatus(aHour, aMinute);
      const bStatus = getHabitStatus(bHour, bMinute);

      // Priority: overdue > now > upcoming
      const statusOrder = { overdue: 0, now: 1, upcoming: 2 };
      const statusDiff = statusOrder[aStatus] - statusOrder[bStatus];

      if (statusDiff !== 0) return statusDiff;
    }

    // Secondary sort: by time of day
    const aTime = aHour * 60 + aMinute;
    const bTime = bHour * 60 + bMinute;
    return aTime - bTime;
  });
}

/**
 * Get habits due at current time (within 30-minute window)
 */
export function getHabitsDueNow(
  habits: Array<{ id: string; scheduledHour?: number; scheduledMinute?: number }>,
  windowMinutes: number = 30
) {
  return habits.filter((habit) => {
    const hour = habit.scheduledHour ?? 0;
    const minute = habit.scheduledMinute ?? 0;
    return getHabitStatus(hour, minute, windowMinutes) === 'now';
  });
}

/**
 * Get next scheduled time for any habit
 */
export function getNextScheduledHabit(
  habits: Array<{ id: string; name: string; scheduledHour?: number; scheduledMinute?: number }>
) {
  const upcoming = habits.filter((h) => {
    const hour = h.scheduledHour ?? 0;
    const minute = h.scheduledMinute ?? 0;
    return getHabitStatus(hour, minute) === 'upcoming';
  });

  if (upcoming.length === 0) return null;

  return upcoming.reduce((earliest, habit) => {
    const habitMinutes = (habit.scheduledHour ?? 0) * 60 + (habit.scheduledMinute ?? 0);
    const earliestMinutes = (earliest.scheduledHour ?? 0) * 60 + (earliest.scheduledMinute ?? 0);
    return habitMinutes < earliestMinutes ? habit : earliest;
  });
}

/**
 * Check if a habit is active on today's day of week
 * Day numbering: 0=Sunday, 1=Monday, ..., 6=Saturday
 */
export function isHabitActiveToday(activeDays?: number[]): boolean {
  // Default to all days if not specified
  if (!activeDays || activeDays.length === 0) {
    return true;
  }

  const today = new Date().getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  return activeDays.includes(today);
}

/**
 * Format active days as a readable string
 * Example: [1, 2, 3, 4, 5] => "Weekdays"
 */
export function formatActiveDays(activeDays?: number[]): string {
  if (!activeDays || activeDays.length === 0) {
    return 'Everyday';
  }

  // Check for common patterns
  const sorted = [...activeDays].sort();
  const weekdays = [1, 2, 3, 4, 5];
  const weekends = [0, 6];
  const allDays = [0, 1, 2, 3, 4, 5, 6];

  if (sorted.length === 7 || sorted.every((d) => allDays.includes(d))) {
    return 'Everyday';
  }

  if (JSON.stringify(sorted) === JSON.stringify(weekdays)) {
    return 'Weekdays';
  }

  if (JSON.stringify(sorted) === JSON.stringify(weekends)) {
    return 'Weekends';
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return sorted.map((d) => dayNames[d]).join(' ');
}
