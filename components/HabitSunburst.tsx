import React, { useMemo } from 'react';
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';
import type { Habit, DailyLog } from '../types';

interface HabitSunburstProps {
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

const HabitSunburst: React.FC<HabitSunburstProps> = ({ habits, logs }) => {
  const data = useMemo(() => {
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

    // Build hierarchical structure
    const categoryMap = new Map<string, { name: string; children: any[] }>();

    habitStats.forEach(({ name, completions, category }) => {
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          name: category.replace(/_/g, ' ').toUpperCase(),
          children: [],
        });
      }

      const categoryData = categoryMap.get(category)!;
      categoryData.children.push({
        name,
        value: Math.max(completions, 1), // Minimum value of 1 for visibility
        completions,
      });
    });

    const root = {
      name: 'All Habits',
      children: Array.from(categoryMap.entries()).map(([category, data]) => ({
        name: data.name,
        children: data.children,
      })),
    };

    return root;
  }, [habits, logs]);

  if (!data.children || data.children.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-slate-200/70 bg-white/70 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        No habits to display
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="value"
          stroke="#1e293b"
          fill="#06b6d4"
          content={<CustomizedContent />}
        >
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#e2e8f0',
            }}
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const data = payload[0].payload as any;
                return (
                  <div className="rounded bg-slate-900 p-2 text-xs text-slate-100 border border-slate-700">
                    <p className="font-semibold">{data.name}</p>
                    {data.completions !== undefined && (
                      <p className="text-slate-400">{data.completions} completions</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

interface CustomizedContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  treeData?: any;
  depth?: number;
  index?: number;
  colors?: string[];
  rankPrefix?: string;
}

const CustomizedContent: React.FC<CustomizedContentProps> = (props) => {
  const { x = 0, y = 0, width = 0, height = 0, treeData } = props;

  if (!treeData) return null;

  const isCategory = treeData.children && treeData.children.length > 0;
  const categoryColor =
    CATEGORY_COLORS[treeData.name.toLowerCase().replace(/ /g, '_') as keyof typeof CATEGORY_COLORS] ||
    '#64748b';

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: isCategory ? categoryColor + '20' : categoryColor + '80',
          stroke: categoryColor,
          strokeWidth: 2,
        }}
      />
      {width > 40 && height > 40 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 5}
            textAnchor="middle"
            fill="#1e293b"
            fontSize={12}
            fontWeight="bold"
            className="dark:fill-slate-200"
          >
            {treeData.name}
          </text>
          {treeData.completions !== undefined && width > 60 && height > 60 && (
            <text
              x={x + width / 2}
              y={y + height / 2 + 15}
              textAnchor="middle"
              fill="#64748b"
              fontSize={10}
              className="dark:fill-slate-400"
            >
              {treeData.completions} times
            </text>
          )}
        </>
      )}
    </g>
  );
};

export default HabitSunburst;
