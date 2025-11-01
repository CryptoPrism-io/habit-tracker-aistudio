import { initialHabits, initialLogs } from '../data/mockData';
import {
  HABIT_CATEGORIES,
  HABIT_DURATION_OPTIONS,
  HABIT_ICON_KEYS,
  HABIT_POINT_OPTIONS,
  HABIT_STREAK_MULTIPLIERS,
} from '../types';
import type { DailyLog, DailyRecord, Habit, HabitIconKey, HabitLogEntry, StoredState } from '../types';

const STORAGE_KEY = 'discipline-forge-state';
const LEGACY_LOG_KEY = 'discipline-forge-logs';
const CURRENT_VERSION = 1;

const ensureTimestamp = (value: string | undefined) =>
  value && !Number.isNaN(Date.parse(value)) ? value : new Date().toISOString();

const ensureId = (id: unknown): string => {
  if (typeof id === 'string' && id.trim()) {
    return id;
  }
  return `habit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

const ensureName = (name: unknown): string => {
  if (typeof name === 'string' && name.trim()) {
    return name.trim();
  }
  return 'New Habit';
};

const ensureCategory = (category: unknown): string => {
  if (typeof category === 'string' && category.trim()) {
    return category.trim();
  }
  return HABIT_CATEGORIES[0];
};

const ensurePoints = (points: unknown): number => {
  if (typeof points === 'number' && HABIT_POINT_OPTIONS.some((value) => value === points)) {
    return points;
  }
  if (typeof points === 'string') {
    const numeric = Number.parseInt(points, 10);
    if (!Number.isNaN(numeric) && HABIT_POINT_OPTIONS.some((value) => value === numeric)) {
      return numeric;
    }
  }
  return HABIT_POINT_OPTIONS[0];
};

const ensureDuration = (duration: unknown): number | undefined => {
  if (typeof duration === 'number' && HABIT_DURATION_OPTIONS.some((value) => value === duration)) {
    return duration;
  }
  if (typeof duration === 'string') {
    const numeric = Number.parseInt(duration, 10);
    if (!Number.isNaN(numeric) && HABIT_DURATION_OPTIONS.some((value) => value === numeric)) {
      return numeric;
    }
  }
  return undefined;
};

const ensureMultiplier = (multiplier: unknown): number => {
  if (typeof multiplier === 'number' && HABIT_STREAK_MULTIPLIERS.some((value) => value === multiplier)) {
    return multiplier;
  }
  if (typeof multiplier === 'string') {
    const numeric = Number.parseInt(multiplier, 10);
    if (!Number.isNaN(numeric) && HABIT_STREAK_MULTIPLIERS.some((value) => value === numeric)) {
      return numeric;
    }
  }
  return HABIT_STREAK_MULTIPLIERS[0];
};

const ensureIconKey = (iconKey: unknown): HabitIconKey | undefined => {
  if (typeof iconKey === 'string' && HABIT_ICON_KEYS.some((key) => key === iconKey)) {
    return iconKey as HabitIconKey;
  }
  return undefined;
};

const ensureTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) {
    return [];
  }
  return tags
    .filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
    .map((tag) => tag.trim());
};

const normaliseHabit = (habit: Habit): Habit => ({
  ...habit,
  id: ensureId(habit.id),
  name: ensureName(habit.name),
  category: ensureCategory(habit.category),
  points: ensurePoints(habit.points),
  durationMinutes: ensureDuration(habit.durationMinutes),
  streakMultiplier: ensureMultiplier(habit.streakMultiplier),
  iconKey: ensureIconKey(habit.iconKey),
  tags: ensureTags(habit.tags),
  active: habit.active ?? true,
  createdAt: ensureTimestamp(habit.createdAt),
  updatedAt: ensureTimestamp(habit.updatedAt),
});

const buildDefaultState = (): StoredState => {
  const habits: Habit[] = initialHabits.map((habit) => normaliseHabit(habit));

  const history: Record<string, DailyRecord> = {};
  initialLogs.forEach((log) => {
    if (!log.completedHabitIds.length) {
      return;
    }
    history[log.date] = {
      date: log.date,
      entries: log.completedHabitIds.map<HabitLogEntry>((habitId) => ({
        habitId,
        completedAt: new Date(`${log.date}T12:00:00.000Z`).toISOString(),
      })),
    };
  });

  return {
    version: CURRENT_VERSION,
    habits,
    history,
  };
};

const sanitiseState = (state: StoredState | undefined | null): StoredState => {
  if (!state || typeof state !== 'object') {
    return buildDefaultState();
  }

  const habits = Array.isArray(state.habits) ? state.habits : [];
  const history = state.history && typeof state.history === 'object' ? state.history : {};

  const normalisedHabits: Habit[] = habits.map((habit) => normaliseHabit({ ...(habit as Habit) }));

  const normalisedHistory: Record<string, DailyRecord> = {};
  Object.entries(history).forEach(([date, record]) => {
    if (!record || typeof record !== 'object') {
      return;
    }
    const entries = Array.isArray(record.entries) ? record.entries : [];
    normalisedHistory[date] = {
      date,
      reflections: record.reflections,
      entries: entries
        .filter((entry) => entry && typeof entry === 'object' && entry.habitId)
        .map((entry) => ({
          habitId: entry.habitId,
          completedAt: ensureTimestamp(entry.completedAt),
          note: entry.note,
          value: entry.value,
        })),
    };
  });

  return {
    version: CURRENT_VERSION,
    habits: normalisedHabits,
    history: normalisedHistory,
  };
};

const migrateLegacyLogs = (logs: DailyLog[]): StoredState => {
  const defaultState = buildDefaultState();
  const history: Record<string, DailyRecord> = { ...defaultState.history };

  logs.forEach((log) => {
    if (!log || !log.date || !Array.isArray(log.completedHabitIds)) {
      return;
    }
    const entries = log.completedHabitIds.map<HabitLogEntry>((habitId) => ({
      habitId,
      completedAt: new Date(`${log.date}T12:00:00.000Z`).toISOString(),
    }));
    if (entries.length) {
      history[log.date] = { date: log.date, entries };
    }
  });

  return {
    ...defaultState,
    history,
  };
};

export const loadStoredState = (): StoredState => {
  if (typeof window === 'undefined') {
    return buildDefaultState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredState;
      const sanitised = sanitiseState(parsed);
      return sanitised;
    }
  } catch {
    /* ignore corrupted state */
  }

  try {
    const legacyRaw = localStorage.getItem(LEGACY_LOG_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as DailyLog[];
      const migrated = migrateLegacyLogs(Array.isArray(legacy) ? legacy : []);
      saveStoredState(migrated);
      localStorage.removeItem(LEGACY_LOG_KEY);
      return migrated;
    }
  } catch {
    /* ignore legacy migration errors */
  }

  const fallback = buildDefaultState();
  saveStoredState(fallback);
  return fallback;
};

export const saveStoredState = (state: StoredState) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage quota exceeded or disabled */
  }
};

export const historyToDailyLogs = (history: Record<string, DailyRecord>): DailyLog[] => {
  return Object.values(history)
    .map((record) => ({
      date: record.date,
      completedHabitIds: record.entries.map((entry) => entry.habitId),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const CURRENT_STATE_VERSION = CURRENT_VERSION;
