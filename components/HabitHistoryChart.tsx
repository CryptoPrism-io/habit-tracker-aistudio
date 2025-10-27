import React from 'react';
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
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700/80 dark:bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-gray-600 dark:border-gray-800 text-white">
        <p className="label text-sm font-semibold">{`${payload[0].payload.date}`}</p>
        <p className="intro text-cyan-400">{`Completed: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

interface HabitHistoryChartProps {
  data: ChartData[];
}

const HabitHistoryChart: React.FC<HabitHistoryChartProps> = ({ data }) => {
  return (
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
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.2)" />
        <XAxis dataKey="name" stroke="rgb(107, 114, 128)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} stroke="rgb(107, 114, 128)" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="completed" stroke="#22d3ee" fill="url(#colorCompleted)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default HabitHistoryChart;