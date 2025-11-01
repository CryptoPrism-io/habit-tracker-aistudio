import React, { useMemo } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Habit, DailyLog } from '../types';
import { HABIT_CATEGORIES } from '../types';

interface CategoryRadialChartProps {
  habits: Habit[];
  logs: DailyLog[];
}

const CATEGORY_COLORS: Record<string, string> = {
  sadhana: '#06b6d4',
  wake_morning: '#f59e0b',
  evening: '#8b5cf6',
  bedtime: '#3b82f6',
  learning: '#10b981',
  reflection: '#ec4899',
  workout_supplements: '#ef4444',
};

const CategoryRadialChart: React.FC<CategoryRadialChartProps> = ({ habits, logs }) => {
  const data = useMemo(() => {
    const categoryStats = new Map<string, { completed: number; total: number }>();

    // Initialize all categories
    HABIT_CATEGORIES.forEach((cat) => {
      categoryStats.set(cat, { completed: 0, total: 0 });
    });

    // Count habits by category
    habits.forEach((habit) => {
      const cat = habit.category as string;
      const stats = categoryStats.get(cat) || { completed: 0, total: 0 };
      stats.total += 1;
      categoryStats.set(cat, stats);
    });

    // Count completions by category
    logs.forEach((log) => {
      log.completedHabitIds.forEach((habitId) => {
        const habit = habits.find((h) => h.id === habitId);
        if (habit) {
          const cat = habit.category as string;
          const stats = categoryStats.get(cat) || { completed: 0, total: 0 };
          stats.completed += 1;
          categoryStats.set(cat, stats);
        }
      });
    });

    // Convert to chart data
    return Array.from(categoryStats.entries())
      .filter(([, stats]) => stats.total > 0)
      .map(([category, stats]) => {
        const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
        return {
          category: category.replace(/_/g, ' ').toUpperCase(),
          rate: Math.round(rate),
          fill: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#64748b',
          completed: stats.completed,
          total: stats.total,
        };
      })
      .sort((a, b) => b.rate - a.rate);
  }, [habits, logs]);

  if (data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-slate-200/70 bg-white/70 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        No habits to display
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          data={data}
          innerRadius="20%"
          outerRadius="100%"
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#e2e8f0',
            }}
            formatter={(value: any) => {
              if (typeof value === 'number') {
                return `${value}%`;
              }
              return value;
            }}
          />
          <RadialBar
            background
            dataKey="rate"
            angleAxisId={0}
            shape="circle"
            label={{
              position: 'insideStart',
              fill: '#fff',
              fontSize: 12,
              fontWeight: 600,
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '12px',
            }}
            iconType="circle"
            iconSize={8}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryRadialChart;
