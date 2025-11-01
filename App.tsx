import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { NavLink, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { Habit, DailyLog, HabitDraft, DailyRecord } from './types';
import {
  HABIT_CATEGORIES,
  HABIT_DURATION_OPTIONS,
  HABIT_ICON_KEYS,
  HABIT_POINT_OPTIONS,
  HABIT_STREAK_MULTIPLIERS,
  HABIT_TAG_SUGGESTIONS,
} from './types';
import { useDisciplineForge } from './hooks/useDisciplineForge';
import { useTheme } from './hooks/useTheme';
import HabitHistoryChart from './components/HabitHistoryChart';
import CategoryRadialChart from './components/CategoryRadialChart';
import CompletionHeatmap from './components/CompletionHeatmap';
import TimeScatterPlot from './components/TimeScatterPlot';
import StreakTimeline from './components/StreakTimeline';
import HabitSunburst from './components/HabitSunburst';
import { getISODateString, formatTimeOfDay } from './utils/date';

const ACCESS_CODE = '1111';
const ACCESS_STORAGE_KEY = 'discipline-forge-access-granted';

const ICON_BADGE_LABELS: Record<(typeof HABIT_ICON_KEYS)[number], string> = {
  sunrise: 'SUN',
  lotus: 'ZEN',
  torch: 'FIRE',
  moon: 'MOON',
  book: 'READ',
  dumbbell: 'GYM',
};

const ICON_OPTION_LABELS: Record<(typeof HABIT_ICON_KEYS)[number], string> = {
  sunrise: 'Sunrise Ritual',
  lotus: 'Sadhana',
  torch: 'Evening Torch',
  moon: 'Moonlight',
  book: 'Learning Sprint',
  dumbbell: 'Strength Stack',
};

const CATEGORY_LABELS: Record<(typeof HABIT_CATEGORIES)[number], string> = {
  sadhana: 'Sadhana',
  wake_morning: 'Wake & Morning',
  evening: 'Evening Routine',
  bedtime: 'Bed Routine',
  learning: 'Learning',
  reflection: 'Reflection',
  workout_supplements: 'Workout & Supplements',
};

const formatCategory = (category: string) =>
  CATEGORY_LABELS[category as (typeof HABIT_CATEGORIES)[number]] ??
  category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

type ForgeStats = ReturnType<typeof useDisciplineForge>['stats'];

const HabitIconBadge: React.FC<{ habit: Habit }> = ({ habit }) => {
  const glyph = habit.iconKey ? ICON_BADGE_LABELS[habit.iconKey] : undefined;
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-xs font-semibold tracking-wide text-cyan-600 dark:text-cyan-300">
      {glyph ?? 'XP'}
    </span>
  );
};

const StatCard: React.FC<{ label: string; value: string; subLabel?: string }> = ({ label, value, subLabel }) => (
  <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
    {subLabel ? <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{subLabel}</p> : null}
  </div>
);

const ThemeToggleButton: React.FC<{ theme: string; onToggle: () => void }> = ({ theme, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-600 transition hover:border-cyan-400 hover:text-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-cyan-500 dark:hover:text-cyan-300"
    aria-label="Toggle theme"
  >
    {theme === 'dark' ? 'LIGHT' : 'DARK'}
  </button>
);

const AccessGate: React.FC<{ onSubmit: (code: string) => boolean }> = ({ onSubmit }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleaned = code.trim();
    if (!cleaned) {
      setError('Enter the access code to continue.');
      return;
    }
    const success = onSubmit(cleaned);
    if (!success) {
      setError('That code is incorrect - check your Phase 2 brief.');
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">
        <div>
          <h1 className="text-2xl font-semibold">Discipline Forge</h1>
          <p className="mt-2 text-sm text-slate-400">Phase 2 portal locked. Provide your access code to continue calibration.</p>
        </div>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-300">Access Code</span>
          <input
            type="password"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setError(null);
            }}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base tracking-widest"
            placeholder="****"
            autoFocus
          />
        </label>
        {error ? <p role="alert" className="text-sm text-rose-400">{error}</p> : null}
        <button type="submit" className="w-full rounded-lg bg-cyan-500 py-2 text-sm font-semibold text-white hover:bg-cyan-600">
          Unlock Phase 2
        </button>
      </form>
    </div>
  );
};

interface AnalyticsPageProps {
  stats: ForgeStats;
  logs: DailyLog[];
  history: Record<string, DailyRecord>;
  habits: Habit[];
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ stats, logs, history, habits }) => {
  const totalCompletions = useMemo(
    () => logs.reduce((sum, log) => sum + log.completedHabitIds.length, 0),
    [logs]
  );

  const bestDay = useMemo(() => {
    let record: { date: string; completions: number } | null = null;
    Object.values(history).forEach((entry) => {
      const count = entry.entries.length;
      if (!record || count > record.completions) {
        record = { date: entry.date, completions: count };
      }
    });
    return record;
  }, [history]);

  const habitLookup = useMemo(() => {
    const map = new Map<string, Habit>();
    habits.forEach((habit) => {
      map.set(habit.id, habit);
    });
    return map;
  }, [habits]);

  const habitBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    logs.forEach((log) => {
      log.completedHabitIds.forEach((habitId) => {
        counts.set(habitId, (counts.get(habitId) ?? 0) + 1);
      });
    });
    return [...counts.entries()]
      .map(([habitId, count]) => {
        const habit = habitLookup.get(habitId);
        return {
          habitId,
          name: habit?.name ?? habitId,
          count,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [logs, habitLookup]);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Guild Metrics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Current Level" value={`Lv ${stats.level}`} />
          <StatCard label="Lifetime XP" value={`${stats.totalPoints.toLocaleString()} pts`} />
          <StatCard label="Active Streak" value={`${stats.streak} days`} />
          <StatCard label="Total Completions" value={totalCompletions.toString()} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">Completion Trend</h3>
          <div className="mt-4 h-72">
            <HabitHistoryChart data={stats.chartData} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">Highlights</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <span className="font-semibold">Top Habit:</span>{' '}
              {habitBreakdown[0] ? `${habitBreakdown[0].name} - ${habitBreakdown[0].count} completions` : 'No completions yet'}
            </li>
            <li>
              <span className="font-semibold">Peak Day:</span>{' '}
              {bestDay ? `${bestDay.date} - ${bestDay.completions} habits completed` : 'No history on record'}
            </li>
            <li>
              <span className="font-semibold">Current Bonus:</span> {Math.round((stats.streakBonusMultiplier - 1) * 100)}%
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Category Performance</h2>
        <div className="mt-4 rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <CategoryRadialChart habits={habits} logs={logs} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Completion Timeline</h2>
        <div className="mt-4 rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <StreakTimeline logs={logs} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Habit Hierarchy</h2>
        <div className="mt-4 rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <HabitSunburst habits={habits} logs={logs} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Completion Patterns</h2>
        <div className="mt-4 rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <TimeScatterPlot habits={habits} history={history} />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">Habit Breakdown</h3>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/70 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-100/70 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Habit</th>
                <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Completions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {habitBreakdown.map((entry) => (
                <tr key={entry.habitId}>
                  <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-200">{entry.name}</td>
                  <td className="px-4 py-2 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">{entry.count}</td>
                </tr>
              ))}
              {habitBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    Complete habits to build analytics history.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
interface HabitManagerPageProps {
  habits: Habit[];
  onAddHabit: (draft: HabitDraft) => void;
  onUpdateHabit: (habitId: string, updates: Partial<HabitDraft>) => void;
}

const HabitManagerPage: React.FC<HabitManagerPageProps> = ({ habits, onAddHabit, onUpdateHabit }) => {
  const [formState, setFormState] = useState({
    name: '',
    category: HABIT_CATEGORIES[0],
    points: '25',
    iconKey: HABIT_ICON_KEYS[0],
    durationMinutes: '',
    streakMultiplier: HABIT_STREAK_MULTIPLIERS[0].toString(),
    description: '',
    tags: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingState, setEditingState] = useState({
    name: '',
    category: HABIT_CATEGORIES[0],
    points: '0',
    iconKey: HABIT_ICON_KEYS[0],
    durationMinutes: '',
    streakMultiplier: HABIT_STREAK_MULTIPLIERS[0].toString(),
    description: '',
    tags: '',
  });

  const mergeTagValue = useCallback((current: string, tag: string) => {
    const existing = current
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
    if (!existing.includes(tag)) {
      existing.push(tag);
    }
    return existing.join(', ');
  }, []);

  const resetForm = () => {
    setFormState({
      name: '',
      category: HABIT_CATEGORIES[0],
      points: '25',
      iconKey: HABIT_ICON_KEYS[0],
      durationMinutes: '',
      streakMultiplier: HABIT_STREAK_MULTIPLIERS[0].toString(),
      description: '',
      tags: '',
    });
    setError(null);
  };

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = formState.name.trim();
    if (!trimmedName) {
      setError('Give your habit a clear name.');
      return;
    }
    const points = Number.parseInt(formState.points, 10);
    if (Number.isNaN(points) || !HABIT_POINT_OPTIONS.some((value) => value === points)) {
      setError('Points must use one of the preset values.');
      return;
    }
    const streakMultiplier = Number.parseInt(formState.streakMultiplier, 10);
    if (
      Number.isNaN(streakMultiplier) ||
      !HABIT_STREAK_MULTIPLIERS.some((value) => value === streakMultiplier)
    ) {
      setError('Select a streak multiplier from the list.');
      return;
    }
    const duration = Number.parseInt(formState.durationMinutes, 10);
    if (
      formState.durationMinutes &&
      (Number.isNaN(duration) || !HABIT_DURATION_OPTIONS.some((value) => value === duration))
    ) {
      setError('Choose a preset duration or leave it blank.');
      return;
    }

    onAddHabit({
      name: trimmedName,
      category: formState.category,
      points,
      iconKey: formState.iconKey,
      durationMinutes: Number.isNaN(duration) ? undefined : duration,
      streakMultiplier,
      description: formState.description || undefined,
      tags: formState.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    resetForm();
  };

  const beginEdit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setEditingState({
      name: habit.name,
      category: habit.category,
      points: habit.points.toString(),
      iconKey: (habit.iconKey ?? HABIT_ICON_KEYS[0]) as string,
      durationMinutes: habit.durationMinutes
        ? habit.durationMinutes.toString()
        : '',
      streakMultiplier: habit.streakMultiplier
        ? habit.streakMultiplier.toString()
        : HABIT_STREAK_MULTIPLIERS[0].toString(),
      description: habit.description ?? '',
      tags: habit.tags?.join(', ') ?? '',
    });
  };

  const handleEditSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingHabitId) {
      return;
    }
    const trimmedName = editingState.name.trim();
    if (!trimmedName) {
      return;
    }
    const points = Number.parseInt(editingState.points, 10);
    if (Number.isNaN(points) || !HABIT_POINT_OPTIONS.some((value) => value === points)) {
      return;
    }
    const streakMultiplier = Number.parseInt(editingState.streakMultiplier, 10);
    if (
      Number.isNaN(streakMultiplier) ||
      !HABIT_STREAK_MULTIPLIERS.some((value) => value === streakMultiplier)
    ) {
      return;
    }
    const duration = Number.parseInt(editingState.durationMinutes, 10);
    if (
      editingState.durationMinutes &&
      (Number.isNaN(duration) || !HABIT_DURATION_OPTIONS.some((value) => value === duration))
    ) {
      return;
    }
    onUpdateHabit(editingHabitId, {
      name: trimmedName,
      category: editingState.category,
      points,
      iconKey: editingState.iconKey,
      durationMinutes: Number.isNaN(duration) ? undefined : duration,
      streakMultiplier,
      description: editingState.description || undefined,
      tags: editingState.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    setEditingHabitId(null);
  };

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Create a New Habit</h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-4 rounded-xl border border-slate-200/70 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/60 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400">Name</span>
            <input
              type="text"
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="Morning mobility"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400">Category</span>
            <select
              value={formState.category}
              onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {HABIT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {formatCategory(category)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400">Points</span>
            <select
              value={formState.points}
              onChange={(event) => setFormState((prev) => ({ ...prev, points: event.target.value }))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {HABIT_POINT_OPTIONS.map((option) => (
                <option key={option} value={option.toString()}>
                  {option} pts
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400">Icon</span>
            <select
              value={formState.iconKey}
              onChange={(event) => setFormState((prev) => ({ ...prev, iconKey: event.target.value }))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {HABIT_ICON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {ICON_OPTION_LABELS[key]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400">Duration</span>
            <select
              value={formState.durationMinutes}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, durationMinutes: event.target.value }))
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">Not timed</option>
              {HABIT_DURATION_OPTIONS.map((option) => (
                <option key={option} value={option.toString()}>
                  {option} minutes
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400">Streak Multiplier</span>
            <select
              value={formState.streakMultiplier}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, streakMultiplier: event.target.value }))
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {HABIT_STREAK_MULTIPLIERS.map((option) => (
                <option key={option} value={option.toString()}>
                  {option}x
                </option>
              ))}
            </select>
          </label>

          <label className="sm:col-span-2 flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400">Description</span>
            <textarea
              value={formState.description}
              onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              rows={3}
              placeholder="Outline what success looks like."
            />
          </label>

          <label className="sm:col-span-2 flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400">Tags (comma separated)</span>
            <input
              type="text"
              value={formState.tags}
              onChange={(event) => setFormState((prev) => ({ ...prev, tags: event.target.value }))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="movement, focus"
            />
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              {HABIT_TAG_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setFormState((prev) => ({ ...prev, tags: mergeTagValue(prev.tags, tag) }))
                  }
                  aria-label={`Add tag: ${tag}`}
                  className="rounded-full border border-slate-200 px-2 py-1 font-medium text-slate-500 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-cyan-500 dark:hover:text-cyan-300"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </label>

          {error ? <p role="alert" className="sm:col-span-2 text-sm text-rose-500">{error}</p> : null}

          <div className="sm:col-span-2 flex justify-end gap-3">
            <button type="button" onClick={resetForm} className="rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              Reset
            </button>
            <button type="submit" className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600">
              Add Habit
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Active Habits</h2>
        <div className="mt-4 space-y-4">
          {habits.map((habit) => (
            <div key={habit.id} className="rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              {editingHabitId === habit.id ? (
                <form onSubmit={handleEditSave} className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Name</span>
                    <input
                      type="text"
                      value={editingState.name}
                      onChange={(event) => setEditingState((prev) => ({ ...prev, name: event.target.value }))}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Category</span>
                    <select
                      value={editingState.category}
                      onChange={(event) => setEditingState((prev) => ({ ...prev, category: event.target.value }))}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {HABIT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {formatCategory(category)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Points</span>
                    <select
                      value={editingState.points}
                      onChange={(event) => setEditingState((prev) => ({ ...prev, points: event.target.value }))}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {HABIT_POINT_OPTIONS.map((option) => (
                        <option key={option} value={option.toString()}>
                          {option} pts
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Icon</span>
                    <select
                      value={editingState.iconKey}
                      onChange={(event) => setEditingState((prev) => ({ ...prev, iconKey: event.target.value }))}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {HABIT_ICON_KEYS.map((key) => (
                        <option key={key} value={key}>
                          {ICON_OPTION_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Duration</span>
                    <select
                      value={editingState.durationMinutes}
                      onChange={(event) =>
                        setEditingState((prev) => ({ ...prev, durationMinutes: event.target.value }))
                      }
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option value="">Not timed</option>
                      {HABIT_DURATION_OPTIONS.map((option) => (
                        <option key={option} value={option.toString()}>
                          {option} minutes
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Streak Multiplier</span>
                    <select
                      value={editingState.streakMultiplier}
                      onChange={(event) =>
                        setEditingState((prev) => ({ ...prev, streakMultiplier: event.target.value }))
                      }
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {HABIT_STREAK_MULTIPLIERS.map((option) => (
                        <option key={option} value={option.toString()}>
                          {option}x
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="sm:col-span-2 flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Description</span>
                    <textarea
                      value={editingState.description}
                      onChange={(event) => setEditingState((prev) => ({ ...prev, description: event.target.value }))}
                      rows={3}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  </label>

                  <label className="sm:col-span-2 flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Tags</span>
                    <input
                      type="text"
                      value={editingState.tags}
                      onChange={(event) => setEditingState((prev) => ({ ...prev, tags: event.target.value }))}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      {HABIT_TAG_SUGGESTIONS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setEditingState((prev) => ({ ...prev, tags: mergeTagValue(prev.tags, tag) }))
                          }
                          aria-label={`Add tag: ${tag}`}
                          className="rounded-full border border-slate-200 px-2 py-1 font-medium text-slate-500 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-cyan-500 dark:hover:text-cyan-300"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </label>

                  <div className="sm:col-span-2 flex justify-end gap-3">
                    <button type="button" onClick={() => setEditingHabitId(null)} className="rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                      Cancel
                    </button>
                    <button type="submit" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-100">{habit.name}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="rounded-full bg-cyan-500/10 px-2 py-1 font-medium text-cyan-600 dark:text-cyan-300">{formatCategory(habit.category)}</span>
                      <span>{habit.points} pts</span>
                      {habit.durationMinutes ? <span>{habit.durationMinutes} min</span> : null}
                      {habit.streakMultiplier ? <span>{habit.streakMultiplier}x</span> : null}
                    </div>
                    {habit.description ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{habit.description}</p> : null}
                    {habit.tags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {habit.tags.map((tag) => (
                          <span key={tag} className="rounded border border-slate-200/60 px-2 py-0.5 dark:border-slate-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => beginEdit(habit)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-cyan-500 dark:hover:text-cyan-300"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {habits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No habits yet - create your first ritual above.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

interface DashboardPageProps {
  stats: ForgeStats;
  habits: Habit[];
  logs: DailyLog[];
  history: Record<string, DailyRecord>;
  onToggleHabit: (habitId: string, date?: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ stats, habits, logs, history, onToggleHabit }) => {
  const [noteBeingAdded, setNoteBeingAdded] = useState<{ habitId: string; note: string } | null>(null);
  const today = getISODateString(new Date());
  const todayCompleted = useMemo(() => {
    const log = logs.find((entry) => entry.date === today);
    return new Set(log?.completedHabitIds ?? []);
  }, [logs, today]);
  const todayRecord = useMemo(() => history[today], [history, today]);
  const completionTimeMap = useMemo(() => {
    const map = new Map<string, { time: string; note?: string }>();
    if (todayRecord) {
      todayRecord.entries.forEach((entry) => {
        map.set(entry.habitId, {
          time: formatTimeOfDay(entry.completedAt),
          note: entry.note
        });
      });
    }
    return map;
  }, [todayRecord]);
  const sortedHabits = useMemo(() => [...habits].sort((a, b) => a.name.localeCompare(b.name)), [habits]);

  const handleCompleteWithNote = useCallback((habitId: string) => {
    const isCompleted = todayCompleted.has(habitId);
    if (isCompleted) {
      // Just toggle off without asking for a note
      onToggleHabit(habitId, today);
    } else {
      // Show note input
      setNoteBeingAdded({ habitId, note: '' });
    }
  }, [todayCompleted, today, onToggleHabit]);

  const handleConfirmNote = useCallback(() => {
    if (noteBeingAdded) {
      onToggleHabit(noteBeingAdded.habitId, today, noteBeingAdded.note);
      setNoteBeingAdded(null);
    }
  }, [noteBeingAdded, today, onToggleHabit]);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Progress Overview</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Guild Level" value={`Lv ${stats.level}`} subLabel={`${stats.pointsForCurrentLevel}/${stats.pointsToNextLevel} XP`} />
          <StatCard label="Total XP" value={`${stats.totalPoints.toLocaleString()} pts`} />
          <StatCard label="Current Streak" value={`${stats.streak} days`} subLabel={`+${Math.round((stats.streakBonusMultiplier - 1) * 100)}% bonus`} />
          <StatCard label="Today's Forge" value={`${stats.todayPoints} pts`} />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Today's Habits</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {todayCompleted.size}/{habits.length} completed
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {sortedHabits.map((habit) => {
            const isCompleted = todayCompleted.has(habit.id);
            const completionInfo = completionTimeMap.get(habit.id);
            return (
              <div
                key={habit.id}
                className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/70 p-4 transition hover:border-cyan-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div className="flex items-center gap-4 flex-1">
                  <HabitIconBadge habit={habit} />
                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-100">{habit.name}</p>
                    <p className="text-xs uppercase tracking-wide text-cyan-500">{formatCategory(habit.category)}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{habit.points} pts</span>
                      {habit.durationMinutes ? <span>{habit.durationMinutes} min</span> : null}
                      {habit.streakMultiplier && habit.streakMultiplier !== 1 ? (
                        <span>{Math.round((habit.streakMultiplier - 1) * 100)}% bonus</span>
                      ) : null}
                      {isCompleted && completionInfo?.time ? (
                        <span className="text-emerald-600 dark:text-emerald-400">at {completionInfo.time}</span>
                      ) : null}
                    </div>
                    {habit.description ? (
                      <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">{habit.description}</p>
                    ) : null}
                    {isCompleted && completionInfo?.note ? (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 italic">Note: {completionInfo.note}</p>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCompleteWithNote(habit.id)}
                  aria-label={isCompleted ? `Mark ${habit.name} as incomplete` : `Mark ${habit.name} as complete`}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {isCompleted ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>
            );
          })}
          {sortedHabits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No active habits yet. Head to the Habit Manager to create your first ritual.
            </div>
          ) : null}
        </div>

        {noteBeingAdded ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                Add a note for {habits.find(h => h.id === noteBeingAdded.habitId)?.name}
              </h3>
              <textarea
                value={noteBeingAdded.note}
                onChange={(e) => setNoteBeingAdded({ ...noteBeingAdded, note: e.target.value })}
                placeholder="How did it go? Any observations?"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                rows={3}
                autoFocus
              />
              <div className="mt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setNoteBeingAdded(null)}
                  className="rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleConfirmNote}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Completion Calendar</h2>
        <div className="mt-4 rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <CompletionHeatmap logs={logs} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Weekly Momentum</h2>
        <div className="mt-4 h-72 rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <HabitHistoryChart data={stats.chartData} />
        </div>
      </section>
    </div>
  );
};

const AppShell: React.FC<{ theme: string; onToggleTheme: () => void; children: React.ReactNode }> = ({
  theme,
  onToggleTheme,
  children,
}) => {
  const location = useLocation();
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/habits', label: 'Habit Manager' },
    { to: '/analytics', label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-500">Discipline Forge</p>
            <h1 className="text-2xl font-bold">Phase 2 Command Deck</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Monitor progress, refine rituals, and track your momentum.</p>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex gap-2 rounded-full bg-slate-100/70 p-1 dark:bg-slate-800/60">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive || location.pathname === link.to
                        ? 'bg-cyan-500 text-white shadow'
                        : 'text-slate-600 hover:text-cyan-500 dark:text-slate-300 dark:hover:text-cyan-300'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <ThemeToggleButton theme={theme} onToggle={onToggleTheme} />
          </div>
        </header>
        <main className="pb-12">{children}</main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { habits, logs, stats, history, toggleHabit, addHabit, updateHabit } = useDisciplineForge();
  const [theme, toggleTheme] = useTheme();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(ACCESS_STORAGE_KEY);
    if (stored === 'true') {
      setHasAccess(true);
    }
  }, []);

  const handleAccessSubmit = useCallback((code: string) => {
    const valid = code === ACCESS_CODE;
    if (valid) {
      setHasAccess(true);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ACCESS_STORAGE_KEY, 'true');
      }
    }
    return valid;
  }, []);

  if (!hasAccess) {
    return <AccessGate onSubmit={handleAccessSubmit} />;
  }

  return (
    <AppShell theme={theme} onToggleTheme={toggleTheme}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage stats={stats} habits={habits} logs={logs} history={history} onToggleHabit={toggleHabit} />} />
        <Route path="/habits" element={<HabitManagerPage habits={habits} onAddHabit={addHabit} onUpdateHabit={updateHabit} />} />
        <Route path="/analytics" element={<AnalyticsPage stats={stats} logs={logs} history={history} habits={habits} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
};

export default App;
