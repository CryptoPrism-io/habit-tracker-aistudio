import { useState, useMemo, useCallback, useEffect } from 'react';
import { POINTS_PER_LEVEL, MAX_STREAK_BONUS_DAYS, STREAK_BONUS_PER_DAY } from '../constants';
import { getISODateString, areDatesConsecutive } from '../utils/date';
import {
  loadStoredState,
  saveStoredState,
  historyToDailyLogs,
} from '../utils/persistence';
import {
  HABIT_DURATION_OPTIONS,
  HABIT_ICON_KEYS,
  HABIT_POINT_OPTIONS,
  HABIT_STREAK_MULTIPLIERS,
  HABIT_CATEGORIES,
} from '../types';
import type { DailyLog, HabitLogEntry, Habit, HabitDraft, StoredState } from '../types';

const buildDailyLogs = (state: StoredState): DailyLog[] => historyToDailyLogs(state.history);

const ensureRecordEntries = (entries: HabitLogEntry[]): HabitLogEntry[] => {
  const seen = new Set<string>();
  return entries
    .slice()
    .reverse()
    .filter((entry) => {
      if (seen.has(entry.habitId)) {
        return false;
      }
      seen.add(entry.habitId);
      return true;
    })
    .reverse();
};

const DEFAULT_ICON_KEY = HABIT_ICON_KEYS[0];

const isAllowedNumber = (value: number, allowed: readonly number[]) =>
  allowed.some((option) => option === value);

const normalisePoints = (points: number) =>
  isAllowedNumber(points, HABIT_POINT_OPTIONS) ? points : HABIT_POINT_OPTIONS[0];

const normaliseDuration = (duration?: number) => {
  if (typeof duration === 'number' && isAllowedNumber(duration, HABIT_DURATION_OPTIONS)) {
    return duration;
  }
  return undefined;
};

const normaliseMultiplier = (multiplier?: number) => {
  if (typeof multiplier === 'number' && isAllowedNumber(multiplier, HABIT_STREAK_MULTIPLIERS)) {
    return multiplier;
  }
  return HABIT_STREAK_MULTIPLIERS[0];
};

const normaliseIconKey = (iconKey?: string) => {
  if (typeof iconKey === 'string' && HABIT_ICON_KEYS.some((key) => key === iconKey)) {
    return iconKey;
  }
  return DEFAULT_ICON_KEY;
};

const normaliseTags = (tags?: string[]) =>
  (tags ?? []).map((tag) => tag.trim()).filter((tag) => tag.length > 0);

const normaliseCategory = (category: string) =>
  (typeof category === 'string' && category.trim()) ? category.trim() : HABIT_CATEGORIES[0];

export const useDisciplineForge = () => {
  const [state, setState] = useState<StoredState>(() => loadStoredState());

  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  const habits = useMemo(() => state.habits.filter((habit) => habit.active !== false), [state.habits]);
  const history = useMemo(() => state.history, [state.history]);
  const logs = useMemo(() => buildDailyLogs(state), [state]);

  const stats = useMemo(() => {
    let streak = 0;
    const completedLogs = logs
      .filter((log) => log.completedHabitIds.length > 0)
      .sort((a, b) => b.date.localeCompare(a.date));

    if (completedLogs.length > 0) {
      const todayStr = getISODateString(new Date());
      const yesterdayStr = getISODateString(new Date(Date.now() - 864e5));
      const latestLogDate = completedLogs[0].date;

      if (latestLogDate === todayStr || latestLogDate === yesterdayStr) {
        streak = 1;
        for (let i = 0; i < completedLogs.length - 1; i++) {
          if (areDatesConsecutive(completedLogs[i].date, completedLogs[i + 1].date)) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    let totalPoints = 0;
    logs.forEach((log) => {
      log.completedHabitIds.forEach((habitId) => {
        const habit = habits.find((h) => h.id === habitId);
        if (habit) {
          totalPoints += habit.points * (habit.streakMultiplier ?? 1);
        }
      });
    });

    const level = Math.floor(totalPoints / POINTS_PER_LEVEL) + 1;
    const pointsForCurrentLevel = totalPoints % POINTS_PER_LEVEL;

    const todayLog = logs.find((log) => log.date === getISODateString(new Date()));
    const todayBasePoints = todayLog
      ? todayLog.completedHabitIds.reduce((sum, id) => {
          const habit = habits.find((h) => h.id === id);
          return sum + ((habit?.points || 0) * (habit?.streakMultiplier ?? 1));
        }, 0)
      : 0;

    const streakBonusMultiplier = 1 + Math.min(streak, MAX_STREAK_BONUS_DAYS) * STREAK_BONUS_PER_DAY;
    const todayPointsWithBonus = Math.round(todayBasePoints * streakBonusMultiplier);

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = getISODateString(date);
      const logForDay = logs.find((log) => log.date === dateStr);
      chartData.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed: logForDay ? logForDay.completedHabitIds.length : 0,
      });
    }

    return {
      level,
      totalPoints,
      streak,
      pointsForCurrentLevel,
      pointsToNextLevel: POINTS_PER_LEVEL,
      todayPoints: todayPointsWithBonus,
      streakBonusMultiplier,
      chartData,
    };
  }, [logs, habits]);

  const toggleHabit = useCallback(
    (habitId: string, dateStr: string = getISODateString(new Date())) => {
      setState((current) => {
        const history = { ...current.history };
        const record = history[dateStr]
          ? { ...history[dateStr], entries: [...history[dateStr].entries] }
          : { date: dateStr, entries: [] };

        const entryIndex = record.entries.findIndex((entry) => entry.habitId === habitId);
        if (entryIndex > -1) {
          record.entries.splice(entryIndex, 1);
        } else {
          record.entries.push({
            habitId,
            completedAt: new Date().toISOString(),
          });
        }

        record.entries = ensureRecordEntries(record.entries);

        if (record.entries.length === 0 && !record.reflections) {
          delete history[dateStr];
        } else {
          history[dateStr] = record;
        }

        return {
          ...current,
          history,
        };
      });
    },
    []
  );

  const addHabit = useCallback((draft: HabitDraft) => {
    setState((current) => {
      const timestamp = new Date().toISOString();
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `habit-${Date.now()}`;

      const safeName = draft.name.trim() || 'New Habit';
      const safeCategory = normaliseCategory(draft.category);
      const safePoints = normalisePoints(draft.points);
      const safeDuration = normaliseDuration(draft.durationMinutes);
      const safeMultiplier = normaliseMultiplier(draft.streakMultiplier);
      const safeIcon = normaliseIconKey(draft.iconKey);
      const safeTags = normaliseTags(draft.tags);

      const newHabit: Habit = {
        id,
        name: safeName,
        category: safeCategory,
        points: safePoints,
        iconKey: safeIcon,
        durationMinutes: safeDuration,
        streakMultiplier: safeMultiplier,
        targetWindow: draft.targetWindow,
        description: draft.description,
        tags: safeTags,
        active: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      return {
        ...current,
        habits: [...current.habits, newHabit],
      };
    });
  }, []);

  const updateHabit = useCallback((habitId: string, updates: Partial<HabitDraft>) => {
    setState((current) => {
      const index = current.habits.findIndex((habit) => habit.id === habitId);
      if (index === -1) {
        return current;
      }

      const timestamp = new Date().toISOString();
      const existing = current.habits[index];
      const existingIcon =
        existing.iconKey && HABIT_ICON_KEYS.some((key) => key === existing.iconKey)
          ? existing.iconKey
          : DEFAULT_ICON_KEY;

      const updatedHabit: Habit = {
        ...existing,
        name:
          updates.name !== undefined
            ? updates.name.trim() || existing.name
            : existing.name,
        category:
          updates.category !== undefined
            ? normaliseCategory(updates.category)
            : existing.category,
        points:
          updates.points !== undefined
            ? normalisePoints(updates.points)
            : normalisePoints(existing.points),
        iconKey:
          updates.iconKey !== undefined
            ? normaliseIconKey(updates.iconKey)
            : existingIcon,
        durationMinutes:
          updates.durationMinutes !== undefined
            ? normaliseDuration(updates.durationMinutes)
            : normaliseDuration(existing.durationMinutes),
        streakMultiplier:
          updates.streakMultiplier !== undefined
            ? normaliseMultiplier(updates.streakMultiplier)
            : normaliseMultiplier(existing.streakMultiplier),
        targetWindow: updates.targetWindow ?? existing.targetWindow,
        description: updates.description ?? existing.description,
        tags: updates.tags ? normaliseTags(updates.tags) : normaliseTags(existing.tags),
        updatedAt: timestamp,
      };

      const habitsCopy = [...current.habits];
      habitsCopy[index] = updatedHabit;

      return {
        ...current,
        habits: habitsCopy,
      };
    });
  }, []);

  const setHabitActive = useCallback((habitId: string, active: boolean) => {
    setState((current) => {
      const index = current.habits.findIndex((habit) => habit.id === habitId);
      if (index === -1) {
        return current;
      }
      const habitsCopy = [...current.habits];
      habitsCopy[index] = {
        ...habitsCopy[index],
        active,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...current,
        habits: habitsCopy,
      };
    });
  }, []);

  return {
    habits,
    logs,
    stats,
    history,
    toggleHabit,
    addHabit,
    updateHabit,
    setHabitActive,
  };
};
