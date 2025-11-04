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
import notificationService from './services/notificationService';
import HabitHistoryChart from './components/HabitHistoryChart';
import CategoryRadialChart from './components/CategoryRadialChart';
import CompletionHeatmap from './components/CompletionHeatmap';
import TimeScatterPlot from './components/TimeScatterPlot';
import StreakTimeline from './components/StreakTimeline';
import HabitSunburst from './components/HabitSunburst';
import LevelProgressRing from './components/LevelProgressRing';
import CollapsibleCard from './components/CollapsibleCard';
import TimePicker from './components/TimePicker';
import DaySelector from './components/DaySelector';
import { getISODateString, formatTimeOfDay } from './utils/date';
import { formatTime, getHabitStatus, getStatusColor, sortHabitsByTime, getHabitsDueNow, isHabitActiveToday, formatActiveDays } from './utils/timeHelpers';

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
  <div className="glass-card rounded-2xl p-4 sm:p-5">
    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 opacity-75">{label}</p>
    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white glow-text-cyan">{value}</p>
    {subLabel ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-300 opacity-70">{subLabel}</p> : null}
  </div>
);

const PenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 20 20" fill="currentColor" focusable="false" aria-hidden="true" {...props}>
    <path d="M13.586 2.586a2 2 0 0 1 2.828 0l1 1a2 2 0 0 1 0 2.828l-1.793 1.793-3.828-3.828L13.586 2.586zm-2.793 3.5 3.828 3.828-6.5 6.5a2 2 0 0 1-.878.505l-3.182.85a.5.5 0 0 1-.607-.607l.85-3.182a2 2 0 0 1 .505-.878l6.484-6.516z" />
  </svg>
);

const ThemeToggleButton: React.FC<{ theme: string; onToggle: () => void }> = ({ theme, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="glass-button flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold transition-all hover:border-cyan-400 hover:text-cyan-400 dark:hover:text-cyan-300"
    aria-label="Toggle theme"
  >
    {theme === 'dark' ? 'Sun' : 'Moon'}
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
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
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
        <CollapsibleCard title="Completion Trend">
          <div className="h-72">
            <HabitHistoryChart data={stats.chartData} />
          </div>
        </CollapsibleCard>
        <CollapsibleCard title="Highlights">
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
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
        </CollapsibleCard>
      </section>

      <CollapsibleCard title="Category Performance">
        <CategoryRadialChart habits={habits} logs={logs} history={history} />
      </CollapsibleCard>

      <CollapsibleCard title="Completion Timeline" defaultOpen={false}>
        <StreakTimeline logs={logs} />
      </CollapsibleCard>

      <CollapsibleCard title="Habit Hierarchy">
        <HabitSunburst habits={habits} logs={logs} />
      </CollapsibleCard>

      <CollapsibleCard title="Completion Patterns">
        <TimeScatterPlot habits={habits} history={history} />
      </CollapsibleCard>

      <CollapsibleCard title="Completion Calendar">
        <CompletionHeatmap logs={logs} />
      </CollapsibleCard>

      <CollapsibleCard title="Habit Breakdown">
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="min-w-[480px] divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-100/70 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Habit</th>
                <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Completions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {habitBreakdown.map((entry) => (
                <tr key={entry.habitId}>
                  <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-200">{entry.name}</td>
                  <td className="px-4 py-2 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">{entry.count}</td>
                </tr>
              ))}
              {habitBreakdown.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                        No completion data yet
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-300">
                        Complete your habits on the Dashboard to see analytics.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CollapsibleCard>
    </div>
  );
};
interface HabitManagerPageProps {
  habits: Habit[];
  onAddHabit: (draft: HabitDraft) => void;
  onUpdateHabit: (habitId: string, updates: Partial<HabitDraft>) => void;
  onDeleteHabit?: (habitId: string) => void;
}

const HabitManagerPage: React.FC<HabitManagerPageProps> = ({ habits, onAddHabit, onUpdateHabit, onDeleteHabit }) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    category: HABIT_CATEGORIES[0],
    points: '25',
    iconKey: HABIT_ICON_KEYS[0],
    durationMinutes: '',
    streakMultiplier: HABIT_STREAK_MULTIPLIERS[0].toString(),
    scheduledHour: 6,
    scheduledMinute: 0,
    activeDays: [0, 1, 2, 3, 4, 5, 6],
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
    scheduledHour: 6,
    scheduledMinute: 0,
    activeDays: [0, 1, 2, 3, 4, 5, 6],
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
      scheduledHour: 6,
      scheduledMinute: 0,
      activeDays: [0, 1, 2, 3, 4, 5, 6],
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
      scheduledHour: formState.scheduledHour,
      scheduledMinute: formState.scheduledMinute,
      activeDays: formState.activeDays,
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
      scheduledHour: habit.scheduledHour ?? 6,
      scheduledMinute: habit.scheduledMinute ?? 0,
      activeDays: habit.activeDays ?? [0, 1, 2, 3, 4, 5, 6],
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
      scheduledHour: editingState.scheduledHour,
      scheduledMinute: editingState.scheduledMinute,
      activeDays: editingState.activeDays,
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
      <section id="create-form">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Create a New Habit</h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-4 rounded-xl border border-slate-300 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">Name</span>
            <input
              type="text"
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="Morning mobility"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">Category</span>
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
            <span className="font-medium text-slate-600 dark:text-slate-300">Points</span>
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
            <span className="font-medium text-slate-600 dark:text-slate-300">Icon</span>
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
            <span className="font-medium text-slate-600 dark:text-slate-300">Duration</span>
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
            <span className="font-medium text-slate-600 dark:text-slate-300">Streak Multiplier</span>
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

          <div className="sm:col-span-2">
            <TimePicker
              hour={formState.scheduledHour}
              minute={formState.scheduledMinute}
              onChange={(hour, minute) =>
                setFormState((prev) => ({ ...prev, scheduledHour: hour, scheduledMinute: minute }))
              }
              label="Scheduled Time"
            />
          </div>

          <div className="sm:col-span-2">
            <DaySelector
              activeDays={formState.activeDays}
              onChange={(days) =>
                setFormState((prev) => ({ ...prev, activeDays: days }))
              }
              label="Active Days"
            />
          </div>

          <label className="sm:col-span-2 flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">Description</span>
            <textarea
              value={formState.description}
              onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              rows={3}
              placeholder="Outline what success looks like."
            />
          </label>

          <label className="sm:col-span-2 flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-300">Tags (comma separated)</span>
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
                  className="rounded-full border border-slate-200 px-2 py-1 font-medium text-slate-500 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-cyan-500 dark:hover:text-cyan-300"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </label>

          {error ? <p role="alert" className="sm:col-span-2 text-sm text-rose-500">{error}</p> : null}

          <div className="sm:col-span-2 flex justify-end gap-3">
            <button type="button" onClick={resetForm} className="rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200">
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
            <div key={habit.id} className="glass-card p-5 rounded-2xl">
              {editingHabitId === habit.id ? (
                <form onSubmit={handleEditSave} className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Name</span>
                    <input
                      type="text"
                      value={editingState.name}
                      onChange={(event) => setEditingState((prev) => ({ ...prev, name: event.target.value }))}
                      className="rounded-lg backdrop-blur-sm border border-slate-300/50 bg-white/50 dark:bg-slate-800/50 dark:border-slate-600/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Category</span>
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
                    <span className="font-medium text-slate-600 dark:text-slate-300">Points</span>
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
                    <span className="font-medium text-slate-600 dark:text-slate-300">Icon</span>
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
                    <span className="font-medium text-slate-600 dark:text-slate-300">Duration</span>
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
                    <span className="font-medium text-slate-600 dark:text-slate-300">Streak Multiplier</span>
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

                  <div className="sm:col-span-2">
                    <TimePicker
                      hour={editingState.scheduledHour}
                      minute={editingState.scheduledMinute}
                      onChange={(hour, minute) =>
                        setEditingState((prev) => ({ ...prev, scheduledHour: hour, scheduledMinute: minute }))
                      }
                      label="Scheduled Time"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <DaySelector
                      activeDays={editingState.activeDays}
                      onChange={(days) =>
                        setEditingState((prev) => ({ ...prev, activeDays: days }))
                      }
                      label="Active Days"
                    />
                  </div>

                  <label className="sm:col-span-2 flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Description</span>
                    <textarea
                      value={editingState.description}
                      onChange={(event) => setEditingState((prev) => ({ ...prev, description: event.target.value }))}
                      rows={3}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                  </label>

                  <label className="sm:col-span-2 flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Tags</span>
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
                          className="rounded-full border border-slate-200 px-2 py-1 font-medium text-slate-500 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-cyan-500 dark:hover:text-cyan-300"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </label>

                  <div className="sm:col-span-2 flex justify-end gap-3">
                    <button type="button" onClick={() => setEditingHabitId(null)} className="rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200">
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
                    <div className="flex items-center gap-3">
                      <p className="text-base font-semibold text-slate-800 dark:text-slate-100">{habit.name}</p>
                      {habit.scheduledHour !== undefined && habit.scheduledMinute !== undefined ? (
                        <span style={{ color: getStatusColor(getHabitStatus(habit.scheduledHour, habit.scheduledMinute)) }} className="text-sm font-semibold px-2 py-1 rounded-full bg-opacity-20">
                          {formatTime(habit.scheduledHour, habit.scheduledMinute)}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-300">
                      <span className="rounded-full bg-cyan-500/10 px-2 py-1 font-medium text-cyan-600 dark:text-cyan-300">{formatCategory(habit.category)}</span>
                      {habit.activeDays && habit.activeDays.length < 7 ? (
                        <span className="px-2 py-1 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50">
                          {formatActiveDays(habit.activeDays)}
                        </span>
                      ) : null}
                      <span>{habit.points} pts</span>
                      {habit.durationMinutes ? <span>{habit.durationMinutes} min</span> : null}
                      {habit.streakMultiplier ? <span>{habit.streakMultiplier}x</span> : null}
                    </div>
                    {habit.description ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{habit.description}</p> : null}
                    {habit.tags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-400">
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
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(habit.id)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:border-red-400 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {habits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center dark:border-slate-700 dark:bg-slate-900/30">
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">No habits yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-300 mb-4">
                Use the form above to create your first habit and start building your discipline.
              </p>
              <a
                href="#create-form"
                className="inline-block rounded-lg bg-cyan-500 px-6 py-2 text-sm font-semibold text-white hover:bg-cyan-600 transition"
              >
                Scroll to Form
              </a>
            </div>
          ) : null}
        </div>

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                Delete habit?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                Are you sure you want to delete "{habits.find(h => h.id === deleteConfirm)?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteHabit?.(deleteConfirm);
                    setDeleteConfirm(null);
                  }}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
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
  const [noteComposer, setNoteComposer] = useState<{ habitId: string; note: string } | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'now' | 'upcoming' | 'overdue'>('all');
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
  const sortedHabits = useMemo(() => {
    let filtered = [...habits];

    // Filter by active days - only show habits active today
    filtered = filtered.filter((habit) => isHabitActiveToday(habit.activeDays));

    if (timeFilter !== 'all') {
      filtered = filtered.filter((habit) => {
        const hour = habit.scheduledHour ?? 0;
        const minute = habit.scheduledMinute ?? 0;
        const status = getHabitStatus(hour, minute);
        return status === timeFilter;
      });
    }

    return filtered.sort((a, b) => {
      // Sort by time, with priority for "now" habits
      const aHour = a.scheduledHour ?? 0;
      const aMinute = a.scheduledMinute ?? 0;
      const bHour = b.scheduledHour ?? 0;
      const bMinute = b.scheduledMinute ?? 0;

      const aTime = aHour * 60 + aMinute;
      const bTime = bHour * 60 + bMinute;

      return aTime - bTime;
    });
  }, [habits, timeFilter]);
  const composerHabit = noteComposer ? habits.find((habit) => habit.id === noteComposer.habitId) : null;
  const composerIsCompleted = noteComposer ? todayCompleted.has(noteComposer.habitId) : false;

  const handleToggleHabit = useCallback(
    (habitId: string) => {
      onToggleHabit(habitId, today);
      if (noteComposer?.habitId === habitId) {
        setNoteComposer(null);
      }
    },
    [noteComposer, onToggleHabit, today]
  );

  const handleOpenNote = useCallback(
    (habitId: string) => {
      const completion = completionTimeMap.get(habitId);
      setNoteComposer({
        habitId,
        note: completion?.note ?? '',
      });
    },
    [completionTimeMap]
  );

  const handleConfirmNote = useCallback(() => {
    if (!noteComposer) {
      return;
    }
    onToggleHabit(noteComposer.habitId, today, noteComposer.note);
    setNoteComposer(null);
  }, [noteComposer, today, onToggleHabit]);

  const handleCloseNote = useCallback(() => {
    setNoteComposer(null);
  }, []);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Progress Overview</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr,2fr]">
          <div className="glass-card rounded-2xl p-5 sm:p-6 flex items-center justify-center">
            <LevelProgressRing
              level={stats.level}
              pointsForCurrentLevel={stats.pointsForCurrentLevel}
              pointsToNextLevel={stats.pointsToNextLevel}
            />
          </div>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <StatCard label="Total XP" value={`${stats.totalPoints.toLocaleString()} pts`} />
            <StatCard label="Current Streak" value={`${stats.streak} days`} subLabel={`+${Math.round((stats.streakBonusMultiplier - 1) * 100)}% bonus`} />
            <StatCard label="Today's Forge" value={`${stats.todayPoints} pts`} />
            <StatCard label="Completion Rate" value={`${todayCompleted.size}/${habits.length}`} subLabel="habits today" />
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Today's Habits</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <p className="text-sm text-slate-500 dark:text-slate-300">
              {todayCompleted.size}/{habits.length} completed
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setTimeFilter('all')}
                className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                  timeFilter === 'all'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('now')}
                className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                  timeFilter === 'now'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                Due Now
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('upcoming')}
                className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                  timeFilter === 'upcoming'
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('overdue')}
                className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                  timeFilter === 'overdue'
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                Overdue
              </button>
              <button
                type="button"
                onClick={() => notificationService.sendTestNotification()}
                className="text-xs px-3 py-1 rounded-full font-medium transition bg-purple-500 text-white hover:bg-purple-600"
                title="Send test notification to verify notifications are working"
              >
                🔔 Test
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {sortedHabits.map((habit) => {
            const isCompleted = todayCompleted.has(habit.id);
            const completionInfo = completionTimeMap.get(habit.id);
            return (
              <div
                key={habit.id}
                className="glass-card flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                  <HabitIconBadge habit={habit} />
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-slate-800 dark:text-slate-100 opacity-90">{habit.name}</p>
                      {habit.scheduledHour !== undefined && habit.scheduledMinute !== undefined ? (
                        <span
                          style={{
                            backgroundColor: `${getStatusColor(getHabitStatus(habit.scheduledHour, habit.scheduledMinute))}20`,
                            color: getStatusColor(getHabitStatus(habit.scheduledHour, habit.scheduledMinute)),
                          }}
                          className="text-xs font-semibold px-2 py-1 rounded-full"
                        >
                          {formatTime(habit.scheduledHour, habit.scheduledMinute)}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs uppercase tracking-wide text-cyan-400 opacity-75">{formatCategory(habit.category)}</p>
                      {habit.activeDays && habit.activeDays.length < 7 ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50">
                          {formatActiveDays(habit.activeDays)}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-300 opacity-80">
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
                      <p className="text-sm text-slate-500 dark:text-slate-300">{habit.description}</p>
                    ) : null}
                    {isCompleted && completionInfo?.note ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300 italic">Note: {completionInfo.note}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleToggleHabit(habit.id)}
                    aria-label={isCompleted ? `Mark ${habit.name} as incomplete` : `Confirm ${habit.name}`}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                      isCompleted
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isCompleted ? 'Completed' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenNote(habit.id)}
                    aria-label={isCompleted ? `Edit note for ${habit.name}` : `Add note for ${habit.name}`}
                    className={`glass-button flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:text-cyan-500 dark:text-slate-300 dark:hover:text-cyan-300 ${
                      completionInfo?.note ? 'ring-1 ring-cyan-400/40' : ''
                    }`}
                    title={completionInfo?.note ? 'Edit note' : 'Add note'}
                  >
                    <PenIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {sortedHabits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center dark:border-slate-700 dark:bg-slate-900/30">
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">Ready to build your first habit?</p>
              <p className="text-sm text-slate-500 dark:text-slate-300 mb-4">
                Create habits and track them daily to build your discipline streak.
              </p>
              <NavLink
                to="/habits"
                className="inline-block rounded-lg bg-cyan-500 px-6 py-2 text-sm font-semibold text-white hover:bg-cyan-600 transition"
              >
                Create Your First Habit
              </NavLink>
            </div>
          ) : null}
        </div>

        {noteComposer ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                {composerIsCompleted ? 'Edit note' : 'Add a note before confirming'}
                {composerHabit ? ` for ${composerHabit.name}` : ''}
              </h3>
              <textarea
                value={noteComposer.note}
                onChange={(event) => setNoteComposer({ ...noteComposer, note: event.target.value })}
                placeholder="How did it go? Any observations?"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 dark:border-slate-700 dark:bg-slate-950"
                rows={3}
                autoFocus
              />
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={handleCloseNote}
                  className="rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmNote}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  {composerIsCompleted ? 'Save note' : 'Save & complete'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Completion Calendar</h2>
        <div className="mt-4 rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <CompletionHeatmap logs={logs} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Weekly Momentum</h2>
        <div className="mt-4 h-72 rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
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
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8">
        <header className="glass-card-strong flex flex-col gap-5 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-400 font-semibold opacity-90">Discipline Forge</p>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Phase 2 Command Deck</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 opacity-80">Monitor progress, refine rituals, and track your momentum.</p>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:flex-nowrap sm:justify-end">
            <nav className="glass-card flex w-full min-w-0 items-center gap-1 rounded-full p-1 sm:w-auto">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex-1 rounded-full px-4 py-2 text-center text-sm font-medium transition-all sm:flex-none ${
                      isActive || location.pathname === link.to
                        ? 'bg-cyan-500 text-white shadow-lg'
                        : 'text-slate-600 hover:text-cyan-400 dark:text-slate-300 dark:hover:text-cyan-300'
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
        <main className="pb-14 sm:pb-16">{children}</main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { habits, logs, stats, history, toggleHabit, addHabit, updateHabit, setHabitActive } = useDisciplineForge();
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

  // Initialize notification service and monitor habits
  useEffect(() => {
    notificationService.init().then((enabled) => {
      if (enabled) {
        // Start monitoring habits when notifications are enabled
        notificationService.startMonitoring(habits);

        // Listen for habit completion from notifications
        const handleHabitComplete = (event: Event) => {
          const customEvent = event as CustomEvent;
          const { habitId } = customEvent.detail;
          if (habitId) {
            toggleHabit(habitId);
          }
        };

        window.addEventListener('habit:complete-from-notification', handleHabitComplete);

        // Cleanup
        return () => {
          window.removeEventListener('habit:complete-from-notification', handleHabitComplete);
          notificationService.stopMonitoring();
        };
      }
    });
  }, [habits, toggleHabit]);

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
        <Route path="/habits" element={<HabitManagerPage habits={habits} onAddHabit={addHabit} onUpdateHabit={updateHabit} onDeleteHabit={(id) => setHabitActive(id, false)} />} />
        <Route path="/analytics" element={<AnalyticsPage stats={stats} logs={logs} history={history} habits={habits} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
};

export default App;
