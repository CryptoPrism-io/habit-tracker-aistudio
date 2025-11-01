import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Habit, DailyRecord } from '../types';

interface TimeScatterPlotProps {
  habits: Habit[];
  history: Record<string, DailyRecord>;
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

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TimeScatterPlot: React.FC<TimeScatterPlotProps> = ({ habits, history }) => {
  const data = useMemo(() => {
    const points: Array<{
      time: number;
      dayOfWeek: number;
      dayName: string;
      habitName: string;
      category: string;
      fill: string;
    }> = [];

    Object.entries(history).forEach(([, record]) => {
      const date = new Date(record.date);
      const dayOfWeek = date.getDay();

      record.entries.forEach((entry) => {
        const habit = habits.find((h) => h.id === entry.habitId);
        if (habit) {
          const completedDate = new Date(entry.completedAt);
          const hours = completedDate.getHours() + completedDate.getMinutes() / 60;

          points.push({
            time: hours,
            dayOfWeek,
            dayName: DAY_NAMES[dayOfWeek],
            habitName: habit.name,
            category: habit.category as string,
            fill: CATEGORY_COLORS[habit.category as keyof typeof CATEGORY_COLORS] || '#64748b',
          });
        }
      });
    });

    return points;
  }, [habits, history]);

  if (data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-slate-200/70 bg-white/70 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        No completion data available
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis
            dataKey="time"
            type="number"
            domain={[0, 24]}
            label={{ value: 'Time of Day (Hours)', position: 'insideBottom', offset: -10 }}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(value) => `${Math.floor(value)}:00`}
          />
          <YAxis
            dataKey="dayOfWeek"
            type="number"
            domain={[0, 6]}
            label={{ value: 'Day of Week', angle: -90, position: 'insideLeft' }}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(value) => DAY_NAMES[value as number] || ''}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#e2e8f0',
            }}
            cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const data = payload[0].payload as any;
                const hours = Math.floor(data.time);
                const minutes = Math.round((data.time - hours) * 60);
                return (
                  <div className="rounded bg-slate-900 p-2 text-xs text-slate-100 border border-slate-700">
                    <p className="font-semibold">{data.habitName}</p>
                    <p>{`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`}</p>
                    <p className="text-slate-400">{data.dayName}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ color: '#94a3b8', paddingTop: '20px' }} />
          {Array.from(
            new Set(
              data.map((d) => d.category)
            )
          ).map((category) => (
            <Scatter
              key={category}
              name={category.replace(/_/g, ' ')}
              data={data.filter((d) => d.category === category)}
              fill={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#64748b'}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeScatterPlot;
