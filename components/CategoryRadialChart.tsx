import React, { useMemo, useState } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Habit, DailyLog } from '../types';
import { HABIT_CATEGORIES } from '../types';

interface CategoryRadialChartProps {
  habits: Habit[];
  logs: DailyLog[];
}

const CATEGORY_COLORS: Record<string, { hex: string; light: string; dark: string }> = {
  sadhana: { hex: '#06b6d4', light: 'rgba(6, 182, 212, 0.8)', dark: 'rgba(6, 182, 212, 0.6)' },
  wake_morning: { hex: '#f59e0b', light: 'rgba(245, 158, 11, 0.8)', dark: 'rgba(245, 158, 11, 0.6)' },
  evening: { hex: '#8b5cf6', light: 'rgba(139, 92, 246, 0.8)', dark: 'rgba(139, 92, 246, 0.6)' },
  bedtime: { hex: '#3b82f6', light: 'rgba(59, 130, 246, 0.8)', dark: 'rgba(59, 130, 246, 0.6)' },
  learning: { hex: '#10b981', light: 'rgba(16, 185, 129, 0.8)', dark: 'rgba(16, 185, 129, 0.6)' },
  reflection: { hex: '#ec4899', light: 'rgba(236, 72, 153, 0.8)', dark: 'rgba(236, 72, 153, 0.6)' },
  workout_supplements: { hex: '#ef4444', light: 'rgba(239, 68, 68, 0.8)', dark: 'rgba(239, 68, 68, 0.6)' },
};

const CategoryRadialChart: React.FC<CategoryRadialChartProps> = ({ habits, logs }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

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

    // Convert to chart data with enhanced color mapping
    return Array.from(categoryStats.entries())
      .filter(([, stats]) => stats.total > 0)
      .map(([category, stats]) => {
        const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
        const colorData = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS];
        return {
          category: category.replace(/_/g, ' ').toUpperCase(),
          categoryKey: category,
          rate: Math.round(rate),
          fill: colorData.hex,
          completed: stats.completed,
          total: stats.total,
          completionRate: rate,
        };
      })
      .sort((a, b) => b.rate - a.rate);
  }, [habits, logs]);

  if (data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-slate-200/30 backdrop-blur-sm bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:border-slate-700/30 dark:from-slate-900/50 dark:to-slate-800/50 text-slate-500 dark:text-slate-400">
        <div className="text-center">
          <p className="text-sm font-medium">No habit data yet</p>
          <p className="text-xs opacity-75 mt-1">Create and complete habits to see performance</p>
        </div>
      </div>
    );
  }

  const customTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{data.category}</p>
          <div className="mt-3 space-y-1.5 text-xs">
            <p className="text-slate-700 dark:text-slate-300">
              <span className="font-medium">Completion Rate:</span> <span className="text-cyan-500 font-semibold">{Math.round(data.completionRate)}%</span>
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              <span className="font-medium">Completed:</span> <span className="font-semibold">{data.completed}/{data.total}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full h-96">
      {/* Enhanced glassmorphic background layer */}
      <div className="absolute inset-0 rounded-2xl border border-slate-200/20 dark:border-slate-700/20 backdrop-blur-xs bg-gradient-to-br from-white/40 to-slate-50/40 dark:from-slate-900/20 dark:to-slate-800/20 pointer-events-none" />

      {/* Chart container */}
      <div className="relative z-10 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={data}
            innerRadius="20%"
            outerRadius="90%"
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={{
                fill: '#94a3b8',
                fontSize: 11,
                fontWeight: 500,
              }}
            />
            <Tooltip content={customTooltip} />
            <RadialBar
              background={{ fill: 'rgba(100, 116, 139, 0.1)' }}
              dataKey="rate"
              angleAxisId={0}
              shape="circle"
              animationDuration={1000}
              animationEasing="ease-out"
              label={{
                position: 'insideStart',
                fill: '#fff',
                fontSize: 13,
                fontWeight: 700,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: '16px',
                fontSize: '12px',
                fontWeight: 500,
              }}
              iconType="circle"
              iconSize={8}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats summary bar */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-slate-200/20 dark:border-slate-700/20 backdrop-blur-sm bg-gradient-to-r from-transparent via-slate-50/50 to-transparent dark:via-slate-800/50 rounded-b-2xl">
        <div className="flex items-center justify-between text-xs gap-4">
          <div className="text-slate-600 dark:text-slate-400">
            <span className="font-medium">{data.length}</span> categories tracked
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            <span className="font-medium">{Math.round(data.reduce((sum, d) => sum + d.completionRate, 0) / data.length)}%</span> avg completion
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            <span className="font-medium">{data.reduce((sum, d) => sum + d.completed, 0)}</span> total completions
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryRadialChart;
