export const HABIT_CATEGORIES = [
  'sadhana',
  'wake_morning',
  'evening',
  'bedtime',
  'learning',
  'reflection',
  'workout_supplements',
] as const;

export const HABIT_POINT_OPTIONS = [25, 50, 75, 100] as const;

export const HABIT_DURATION_OPTIONS = [15, 30, 45, 60] as const;

export const HABIT_STREAK_MULTIPLIERS = [1, 2, 3] as const;

export const HABIT_ICON_KEYS = ['sunrise', 'lotus', 'torch', 'moon', 'book', 'dumbbell'] as const;

export const HABIT_TAG_SUGGESTIONS = [
  'discipline',
  'focus',
  'mindfulness',
  'strength',
  'recovery',
  'gratitude',
  'planning',
  'learning',
  'nutrition',
  'sleep',
] as const;

export type HabitCategory = typeof HABIT_CATEGORIES[number] | string;
export type HabitIconKey = typeof HABIT_ICON_KEYS[number];

export interface TimeWindow {
  start: string; // HH:mm (24h)
  end: string;   // HH:mm (24h)
}

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  points: number;
  iconKey?: HabitIconKey;
  durationMinutes?: number;
  streakMultiplier?: number;
  targetWindow?: TimeWindow;
  scheduledHour?: number; // 0-23 (24-hour format)
  scheduledMinute?: number; // 0-59
  activeDays?: number[]; // 0=Sunday, 1=Monday, ... 6=Saturday. Default: all days
  description?: string;
  tags?: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLogEntry {
  habitId: string;
  completedAt: string;
  note?: string;
  value?: string | number;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  entries: HabitLogEntry[];
  reflections?: string;
}

export interface StoredState {
  version: number;
  habits: Habit[];
  history: Record<string, DailyRecord>;
}

export interface HabitDraft {
  name: string;
  category: HabitCategory;
  points: number;
  iconKey?: HabitIconKey;
  durationMinutes?: number;
  streakMultiplier?: number;
  targetWindow?: TimeWindow;
  scheduledHour?: number; // 0-23 (24-hour format)
  scheduledMinute?: number; // 0-59
  activeDays?: number[]; // 0=Sunday, 1=Monday, ... 6=Saturday. Default: all days
  description?: string;
  tags?: string[];
}

// Legacy shape maintained for components that still consume simple arrays
export interface DailyLog {
  date: string;
  completedHabitIds: string[];
}
