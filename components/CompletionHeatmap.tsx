import React, { useMemo } from 'react';
import type { DailyLog } from '../types';
import { getISODateString } from '../utils/date';

interface CompletionHeatmapProps {
  logs: DailyLog[];
}

const CompletionHeatmap: React.FC<CompletionHeatmapProps> = ({ logs }) => {
  const { days, maxCompletions } = useMemo(() => {
    const logsMap = new Map<string, number>();

    logs.forEach((log) => {
      logsMap.set(log.date, log.completedHabitIds.length);
    });

    // Generate 90 days of data
    const days = [];
    let max = 0;
    for (let i = 89; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = getISODateString(date);
      const count = logsMap.get(dateStr) || 0;
      max = Math.max(max, count);
      days.push({
        date: dateStr,
        count,
        dayOfWeek: date.getDay(),
        week: Math.floor(i / 7),
      });
    }

    return { days, maxCompletions: max };
  }, [logs]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-200 dark:bg-slate-800';
    const intensity = Math.min(count / Math.max(maxCompletions, 1), 1);
    if (intensity < 0.25) return 'bg-cyan-100 dark:bg-cyan-900';
    if (intensity < 0.5) return 'bg-cyan-300 dark:bg-cyan-700';
    if (intensity < 0.75) return 'bg-cyan-500 dark:bg-cyan-500';
    return 'bg-cyan-600 dark:bg-cyan-400';
  };

  // Group by weeks
  const weeks = useMemo(() => {
    const weekMap = new Map<number, typeof days>();
    days.forEach((day) => {
      if (!weekMap.has(day.week)) {
        weekMap.set(day.week, []);
      }
      weekMap.get(day.week)!.push(day);
    });
    return Array.from(weekMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, weekDays]) => weekDays.sort((a, b) => a.dayOfWeek - b.dayOfWeek));
  }, [days]);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <div className="flex gap-1 pb-4" style={{ minWidth: 'max-content' }}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`w-3 h-3 rounded-sm cursor-pointer transition hover:ring-2 hover:ring-cyan-400 ${getColor(day.count)}`}
                  title={`${day.date}: ${day.count} completions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-800" />
          <div className="w-3 h-3 rounded-sm bg-cyan-100 dark:bg-cyan-900" />
          <div className="w-3 h-3 rounded-sm bg-cyan-300 dark:bg-cyan-700" />
          <div className="w-3 h-3 rounded-sm bg-cyan-500 dark:bg-cyan-500" />
          <div className="w-3 h-3 rounded-sm bg-cyan-600 dark:bg-cyan-400" />
        </div>
        <span>More</span>
      </div>

      {maxCompletions > 0 && (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Max completions in a day: <span className="font-semibold">{maxCompletions}</span>
        </div>
      )}
    </div>
  );
};

export default CompletionHeatmap;
