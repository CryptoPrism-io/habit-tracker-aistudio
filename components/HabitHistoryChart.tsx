import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from 'recharts';


interface ChartData {
  name: string;
  date: string;
  completed: number;
  points?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  mode?: 'completions' | 'points';
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, mode = 'completions' }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const label = mode === 'completions' ? 'Completed' : 'Points Earned';
    return (
      <div className="bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg border border-slate-700 text-white">
        <p className="text-sm font-semibold">{`${payload[0].payload.date}`}</p>
        <p className="text-cyan-400">{`${label}: ${value}`}</p>
      </div>
    );
  }
  return null;
};

interface HabitHistoryChartProps {
  data: ChartData[];
}

const HabitHistoryChart: React.FC<HabitHistoryChartProps> = ({ data }) => {
  const [mode, setMode] = useState<'completions' | 'points'>('completions');

  const hasPoints = data.some(d => d.points !== undefined && d.points > 0);

  return (
    <div className="flex flex-col gap-4 h-full">
      {hasPoints && (
        <div className="flex gap-2">
          <button
            onClick={() => setMode('completions')}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              mode === 'completions'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Completions
          </button>
          <button
            onClick={() => setMode('points')}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              mode === 'points'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Points
          </button>
        </div>
      )}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10, right: 30, left: 0, bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.2)" />
            <XAxis dataKey="name" stroke="rgb(107, 114, 128)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} stroke="rgb(107, 114, 128)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip mode={mode} />} />
            {mode === 'completions' ? (
              <Area type="monotone" dataKey="completed" stroke="#22d3ee" fill="url(#colorCompleted)" strokeWidth={2} />
            ) : (
              <Area type="monotone" dataKey="points" stroke="#06b6d4" fill="url(#colorPoints)" strokeWidth={2} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HabitHistoryChart;