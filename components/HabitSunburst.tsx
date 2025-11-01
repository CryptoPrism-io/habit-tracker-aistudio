import React, { useMemo } from 'react';
import type { Habit, DailyLog } from '../types';

interface HabitSunburstProps {
  habits: Habit[];
  logs: DailyLog[];
}

const CATEGORY_COLORS: Record<string, string> = {
  sadhana: 'bg-cyan-100 dark:bg-cyan-900/40 border-cyan-300 dark:border-cyan-700 text-cyan-900 dark:text-cyan-100',
  wake_morning: 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100',
  evening: 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-100',
  bedtime: 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100',
  learning: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100',
  reflection: 'bg-pink-100 dark:bg-pink-900/40 border-pink-300 dark:border-pink-700 text-pink-900 dark:text-pink-100',
  workout_supplements: 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100',
};

const DUMMY_HABITS = [
  { name: 'Morning Meditation', completions: 32, category: 'sadhana' as const },
  { name: 'Early Wake Up', completions: 28, category: 'wake_morning' as const },
  { name: 'Evening Walk', completions: 24, category: 'evening' as const },
  { name: 'Sleep Schedule', completions: 35, category: 'bedtime' as const },
  { name: 'Reading', completions: 18, category: 'learning' as const },
  { name: 'Journaling', completions: 22, category: 'reflection' as const },
  { name: 'Gym Session', completions: 15, category: 'workout_supplements' as const },
  { name: 'Yoga Practice', completions: 20, category: 'sadhana' as const },
  { name: 'Learning Course', completions: 25, category: 'learning' as const },
  { name: 'Stretching', completions: 30, category: 'workout_supplements' as const },
];

interface HabitData {
  name: string;
  completions: number;
  category: string;
}

const HabitSunburst: React.FC<HabitSunburstProps> = ({ habits, logs }) => {
  const { data, isDemoData } = useMemo(() => {
    // Count completions per habit
    const habitStats = new Map<string, { name: string; completions: number; category: string }>();

    habits.forEach((habit) => {
      habitStats.set(habit.id, {
        name: habit.name,
        completions: 0,
        category: habit.category as string,
      });
    });

    logs.forEach((log) => {
      log.completedHabitIds.forEach((habitId) => {
        const stat = habitStats.get(habitId);
        if (stat) {
          stat.completions += 1;
        }
      });
    });

    // Build data structure
    let habitData = Array.from(habitStats.entries())
      .map(([, { name, completions, category }]) => ({
        name,
        completions,
        category,
      }))
      .sort((a, b) => b.completions - a.completions);

    // Check if we have meaningful data (any completions)
    const hasMeaningfulData = habitData.some((h) => h.completions > 0);
    let isDemo = false;

    // If no real data or no completions, use dummy data
    if (habitData.length === 0 || !hasMeaningfulData) {
      habitData = DUMMY_HABITS.slice().sort((a, b) => b.completions - a.completions);
      isDemo = true;
    }

    return { data: habitData, isDemoData: isDemo };
  }, [habits, logs]);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
        No habit data available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4 border border-slate-200 dark:border-slate-700 rounded-xl">
      {isDemoData && (
        <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-medium text-blue-700 dark:text-blue-300">
          📊 Demo Data - Complete your habits to see real data
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((habit) => {
          const categoryClass = `glass-${habit.category.replace(/_/g, '-')}`;
          const baseClasses = `glass-card p-5 rounded-2xl border-2 transition-all hover:border-opacity-75 cursor-pointer group`;

          return (
            <div
              key={habit.name}
              className={`${baseClasses} ${categoryClass}`}
            >
              <div className="font-semibold text-sm mb-3 truncate text-slate-800 dark:text-slate-100 opacity-90 group-hover:opacity-100">
                {habit.name}
              </div>
              <div className="text-3xl font-bold text-slate-800 dark:text-white mb-2 glow-text-cyan">
                {habit.completions}
              </div>
              <div className="text-xs opacity-70 text-slate-700 dark:text-slate-300">
                {habit.completions === 1 ? 'completion' : 'completions'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitSunburst;
