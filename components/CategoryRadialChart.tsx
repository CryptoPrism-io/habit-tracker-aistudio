import React, { useMemo } from 'react';
import { RadarChart, Radar, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip, PolarGrid } from 'recharts';
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

  const { radarData, categoryInfo } = useMemo(() => {
    const categoryStats = new Map<string, { completed: number; total: number; color: string }>();

    // Initialize all categories
    HABIT_CATEGORIES.forEach((cat) => {
      const colorData = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS];
      categoryStats.set(cat, { completed: 0, total: 0, color: colorData.hex });
    });

    // Count habits by category
    habits.forEach((habit) => {
      const cat = habit.category as string;
      const stats = categoryStats.get(cat);
      if (stats) {
        stats.total += 1;
      }
    });

    // Count completions by category
    logs.forEach((log) => {
      log.completedHabitIds.forEach((habitId) => {
        const habit = habits.find((h) => h.id === habitId);
        if (habit) {
          const cat = habit.category as string;
          const stats = categoryStats.get(cat);
          if (stats) {
            stats.completed += 1;
          }
        }
      });
    });

    // Build radar chart data and category info
    const activeCategories = Array.from(categoryStats.entries())
      .filter(([, stats]) => stats.total > 0)
      .sort(([a], [b]) => a.localeCompare(b));

    const radarChartData = activeCategories.map(([category, stats]) => {
      const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
      const categoryLabel = category.replace(/_/g, ' ').toUpperCase();
      return {
        category: categoryLabel,
        rate: Math.round(rate),
      };
    });

    const categoryMetadata = activeCategories.map(([category, stats]) => {
      const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
      return {
        label: category.replace(/_/g, ' ').toUpperCase(),
        rate: Math.round(rate),
        completed: stats.completed,
        total: stats.total,
        color: stats.color,
      };
    });

    return { radarData: radarChartData, categoryInfo: categoryMetadata };
  }, [habits, logs]);

  const data = categoryInfo;

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
      const categoryLabel = payload[0].payload.category;
      const categoryData = data.find((cat) => cat.label === categoryLabel);
      if (categoryData) {
        return (
          <div className="glass-card p-3 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{categoryData.label}</p>
            <div className="mt-2 space-y-1 text-xs">
              <p className="text-slate-700 dark:text-slate-300">
                <span className="font-medium">Completion:</span> <span className="font-semibold text-cyan-500">{categoryData.rate}%</span>
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <span className="font-medium">Completed:</span> <span className="font-semibold">{categoryData.completed}/{categoryData.total}</span>
              </p>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="relative w-full h-[450px]">
      {/* Enhanced glassmorphic background layer */}
      <div className="absolute inset-0 rounded-2xl border border-slate-200/20 dark:border-slate-700/20 backdrop-blur-xs bg-gradient-to-br from-white/40 to-slate-50/40 dark:from-slate-900/20 dark:to-slate-800/20 pointer-events-none" />

      {/* Chart title and subtitle */}
      <div className="relative z-20 px-6 pt-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Habit Category Performance</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Completion rates across all categories</p>
      </div>

      {/* Chart container */}
      <div className="relative z-10 w-full h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid
              stroke="rgba(148, 163, 184, 0.15)"
              strokeDasharray="0"
              isAnimationActive={true}
            />
            <PolarAngleAxis
              dataKey="category"
              tick={{
                fill: '#94a3b8',
                fontSize: 11,
                fontWeight: 500,
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{
                fill: '#94a3b8',
                fontSize: 10,
              }}
              axisLineType="circle"
            />
            <Tooltip content={customTooltip} />
            <Radar
              name="Completion Rate"
              dataKey="rate"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.4}
              animationDuration={1200}
              animationEasing="ease-out"
              isAnimationActive={true}
              strokeWidth={2.5}
              dot={{ fill: '#06b6d4', r: 4, strokeWidth: 2.5, stroke: '#fff' }}
              activeDot={{ r: 6.5, strokeWidth: 3 }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: '12px',
                fontSize: '11px',
                fontWeight: 500,
              }}
              iconType="circle"
              iconSize={6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats summary bar */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-3 border-t border-slate-200/20 dark:border-slate-700/20 backdrop-blur-sm bg-gradient-to-r from-transparent via-slate-50/50 to-transparent dark:via-slate-800/50 rounded-b-2xl">
        <div className="flex items-center justify-between text-xs gap-4">
          <div className="text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{data.length}</span> <span className="opacity-75">categories</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-cyan-500">{Math.round(data.reduce((sum, d) => sum + d.rate, 0) / data.length)}%</span> <span className="opacity-75">avg rate</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{data.reduce((sum, d) => sum + d.completed, 0)}</span> <span className="opacity-75">completions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryRadialChart;
