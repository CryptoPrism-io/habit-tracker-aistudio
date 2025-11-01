import React, { useMemo, useState } from 'react';
import { RadarChart, Radar, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip, PolarGrid } from 'recharts';
import type { Habit, DailyLog, DailyRecord } from '../types';
import { HABIT_CATEGORIES } from '../types';
import { getISODateString } from '../utils/date';

interface CategoryRadialChartProps {
  habits: Habit[];
  logs: DailyLog[];
  history?: Record<string, DailyRecord>;
}

type TimePeriod = 'daily' | 'weekly' | 'monthly';

const CATEGORY_COLORS: Record<string, { hex: string; light: string; dark: string }> = {
  sadhana: { hex: '#06b6d4', light: 'rgba(6, 182, 212, 0.8)', dark: 'rgba(6, 182, 212, 0.6)' },
  wake_morning: { hex: '#f59e0b', light: 'rgba(245, 158, 11, 0.8)', dark: 'rgba(245, 158, 11, 0.6)' },
  evening: { hex: '#8b5cf6', light: 'rgba(139, 92, 246, 0.8)', dark: 'rgba(139, 92, 246, 0.6)' },
  bedtime: { hex: '#3b82f6', light: 'rgba(59, 130, 246, 0.8)', dark: 'rgba(59, 130, 246, 0.6)' },
  learning: { hex: '#10b981', light: 'rgba(16, 185, 129, 0.8)', dark: 'rgba(16, 185, 129, 0.6)' },
  reflection: { hex: '#ec4899', light: 'rgba(236, 72, 153, 0.8)', dark: 'rgba(236, 72, 153, 0.6)' },
  workout_supplements: { hex: '#ef4444', light: 'rgba(239, 68, 68, 0.8)', dark: 'rgba(239, 68, 68, 0.6)' },
};

const CategoryRadialChart: React.FC<CategoryRadialChartProps> = ({ habits, logs, history = {} }) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');

  // Helper function to get date range
  const getDateRange = (period: TimePeriod): { start: Date; end: Date } => {
    const today = new Date();
    const start = new Date();

    if (period === 'daily') {
      start.setDate(today.getDate());
    } else if (period === 'weekly') {
      start.setDate(today.getDate() - 6);
    } else {
      start.setDate(today.getDate() - 29);
    }

    return { start, end: today };
  };

  // Helper function to get day of week name
  const getDayName = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  // Helper function to extract data by time period
  const extractDataByPeriod = (period: TimePeriod) => {
    const { start, end } = getDateRange(period);
    const categoryStats = new Map<string, { completed: number; total: number; color: string }>();

    // Initialize all categories
    HABIT_CATEGORIES.forEach((cat) => {
      const colorData = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS];
      categoryStats.set(cat, { completed: 0, total: 0, color: colorData.hex });
    });

    if (period === 'daily') {
      // For daily: show today's data (0 or 1 per category)
      const today = getISODateString(new Date());
      const todayRecord = history[today];
      const habitsInCategories = new Map<string, number>();

      // Count habits in each category
      habits.forEach((habit) => {
        const cat = habit.category as string;
        const stats = categoryStats.get(cat);
        if (stats) {
          stats.total += 1;
        }
      });

      // Count completions
      if (todayRecord) {
        todayRecord.entries.forEach((entry) => {
          const habit = habits.find((h) => h.id === entry.habitId);
          if (habit) {
            const cat = habit.category as string;
            const stats = categoryStats.get(cat);
            if (stats && !habitsInCategories.has(cat)) {
              stats.completed = 1;
              habitsInCategories.set(cat, 1);
            }
          }
        });
      }
    } else if (period === 'weekly') {
      // For weekly: show 7 days of data (0-7 completions per day per category)
      const dailyData = new Map<string, { day: string; completions: number }[]>();

      HABIT_CATEGORIES.forEach((cat) => {
        dailyData.set(cat, []);
      });

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = getISODateString(date);
        const dayName = getDayName(date);
        const record = history[dateStr];

        HABIT_CATEGORIES.forEach((cat) => {
          let count = 0;
          if (record) {
            record.entries.forEach((entry) => {
              const habit = habits.find((h) => h.id === entry.habitId);
              if (habit && habit.category === cat) {
                count++;
              }
            });
          }
          dailyData.get(cat)?.push({ day: dayName, completions: count });
        });
      }

      // For weekly, we'll structure it differently (see below in radarChartData)
      return { radarData: dailyData, categoryStats, mode: 'weekly' };
    } else {
      // For monthly: show aggregated category performance (0-100% scale)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 29);

      // Count habits in each category
      habits.forEach((habit) => {
        const cat = habit.category as string;
        const stats = categoryStats.get(cat);
        if (stats) {
          stats.total += 1;
        }
      });

      // Count completions in date range
      for (const dateStr in history) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const recordDate = new Date(year, month - 1, day);

        if (recordDate >= startDate && recordDate <= endDate) {
          const record = history[dateStr];
          record.entries.forEach((entry) => {
            const habit = habits.find((h) => h.id === entry.habitId);
            if (habit) {
              const cat = habit.category as string;
              const stats = categoryStats.get(cat);
              if (stats) {
                stats.completed += 1;
              }
            }
          });
        }
      }
    }

    return { categoryStats, mode: period };
  };

  const { radarData, categoryInfo, maxValue } = useMemo(() => {
    const { categoryStats, mode } = extractDataByPeriod(timePeriod);

    // Build radar chart data and category info
    const activeCategories = Array.from(categoryStats.entries())
      .filter(([, stats]) => stats.total > 0)
      .sort(([a], [b]) => a.localeCompare(b));

    let radarChartData: any[];
    let maxVal = 100;

    if (timePeriod === 'daily') {
      // Daily: 0-1 scale
      radarChartData = activeCategories.map(([category, stats]) => {
        const categoryLabel = category.replace(/_/g, ' ').toUpperCase();
        return {
          category: categoryLabel,
          rate: stats.completed,
        };
      });
      maxVal = 1;
    } else if (timePeriod === 'weekly') {
      // Weekly: 0-7 scale (7 days)
      radarChartData = activeCategories.map(([category]) => {
        const categoryLabel = category.replace(/_/g, ' ').toUpperCase();
        const categoryEntry: any = { category: categoryLabel };
        // Will be populated by daily data
        return categoryEntry;
      });
      maxVal = 7;
    } else {
      // Monthly: 0-100% scale
      radarChartData = activeCategories.map(([category, stats]) => {
        const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
        const categoryLabel = category.replace(/_/g, ' ').toUpperCase();
        return {
          category: categoryLabel,
          rate: Math.round(rate),
        };
      });
      maxVal = 100;
    }

    const categoryMetadata = activeCategories.map(([category, stats]) => {
      let rate = 0;
      let displayRate = 0;

      if (timePeriod === 'daily') {
        rate = stats.completed * 100; // 0 or 100
        displayRate = stats.completed * 100;
      } else if (timePeriod === 'weekly') {
        displayRate = stats.completed; // Show total for week
        rate = stats.total > 0 ? (stats.completed / (stats.total * 7)) * 100 : 0;
      } else {
        rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
        displayRate = rate;
      }

      return {
        label: category.replace(/_/g, ' ').toUpperCase(),
        rate: Math.round(displayRate),
        completed: stats.completed,
        total: stats.total,
        color: stats.color,
      };
    });

    return { radarData: radarChartData, categoryInfo: categoryMetadata, maxValue: maxVal };
  }, [habits, logs, history, timePeriod]);

  const data = categoryInfo;

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

  const getPeriodLabel = () => {
    if (timePeriod === 'daily') return 'Today';
    if (timePeriod === 'weekly') return 'This Week';
    return 'This Month';
  };

  return (
    <div className="relative w-full h-[500px]">
      {/* Enhanced glassmorphic background layer */}
      <div className="absolute inset-0 rounded-2xl border border-slate-200/20 dark:border-slate-700/20 backdrop-blur-xs bg-gradient-to-br from-white/40 to-slate-50/40 dark:from-slate-900/20 dark:to-slate-800/20 pointer-events-none" />

      {/* Chart header with title and time period selector */}
      <div className="relative z-20 px-6 pt-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Habit Category Performance</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Showing {getPeriodLabel()}</p>
        </div>

        {/* Time Period Selector */}
        <div className="flex gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-lg p-1 border border-slate-200/30 dark:border-slate-700/30">
          {(['daily', 'weekly', 'monthly'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timePeriod === period
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="relative z-10 w-full h-[360px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-slate-200/20 dark:border-slate-700/20 bg-gradient-to-br from-slate-50/30 to-slate-100/30 dark:from-slate-900/30 dark:to-slate-800/30">
            <div className="text-center px-6">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No habit data available</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Create and complete habits to see performance metrics</p>
            </div>
          </div>
        ) : (
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
                domain={[0, maxValue]}
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
        )}
      </div>

      {/* Stats summary bar - only show if there's data */}
      {data.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 px-6 py-3 border-t border-slate-200/20 dark:border-slate-700/20 backdrop-blur-sm bg-gradient-to-r from-transparent via-slate-50/50 to-transparent dark:via-slate-800/50 rounded-b-2xl">
          <div className="flex items-center justify-between text-xs gap-4">
            <div className="text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-slate-100">{data.length}</span> <span className="opacity-75">categories</span>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              {timePeriod === 'daily' ? (
                <>
                  <span className="font-semibold text-cyan-500">{data.filter((d) => d.rate > 0).length}</span> <span className="opacity-75">started</span>
                </>
              ) : timePeriod === 'weekly' ? (
                <>
                  <span className="font-semibold text-cyan-500">{data.reduce((sum, d) => sum + d.rate, 0)}</span> <span className="opacity-75">total completions</span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-cyan-500">{Math.round(data.reduce((sum, d) => sum + d.rate, 0) / data.length)}</span> <span className="opacity-75">% avg</span>
                </>
              )}
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-slate-100">{data.reduce((sum, d) => sum + d.completed, 0)}</span> <span className="opacity-75">{timePeriod === 'daily' ? 'completed today' : 'completions'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryRadialChart;
