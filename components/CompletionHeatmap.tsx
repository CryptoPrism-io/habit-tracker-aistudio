import React, { useMemo, useState } from 'react';
import type { DailyLog } from '../types';
import { getISODateString } from '../utils/date';

interface CompletionHeatmapProps {
  logs: DailyLog[];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarDay {
  date: string;
  count: number;
  day: number;
  dayOfWeek: number;
  displayDate: Date;
}

const CompletionHeatmap: React.FC<CompletionHeatmapProps> = ({ logs }) => {
  // State for currently selected month
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month, -1 = last month, etc.

  const { monthData, maxCompletions, calendarDays } = useMemo(() => {
    const logsMap = new Map<string, number>();

    logs.forEach((log) => {
      logsMap.set(log.date, log.completedHabitIds.length);
    });

    // Get the month to display
    const displayDate = new Date();
    displayDate.setMonth(displayDate.getMonth() + monthOffset);

    const month = displayDate.getMonth();
    const year = displayDate.getFullYear();
    let max = 0;

    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();

    // Build calendar array with proper grid structure
    const allDays: (CalendarDay | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      allDays.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const cellDate = new Date(year, month, day);
      const dateStr = getISODateString(cellDate);
      const count = logsMap.get(dateStr) || 0;
      max = Math.max(max, count);

      allDays.push({
        date: dateStr,
        count,
        day,
        dayOfWeek: cellDate.getDay(),
        displayDate: cellDate,
      });
    }

    return {
      monthData: { month, year, monthName: MONTH_NAMES[month] },
      maxCompletions: max,
      calendarDays: allDays,
    };
  }, [logs, monthOffset]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-150 dark:hover:bg-slate-700';
    const intensity = Math.min(count / Math.max(maxCompletions, 1), 1);
    if (intensity < 0.25) return 'bg-cyan-200 dark:bg-cyan-900 hover:ring-2 hover:ring-cyan-300 dark:hover:ring-cyan-700';
    if (intensity < 0.5) return 'bg-cyan-400 dark:bg-cyan-700 hover:ring-2 hover:ring-cyan-400 dark:hover:ring-cyan-600';
    if (intensity < 0.75) return 'bg-cyan-500 dark:bg-cyan-600 hover:ring-2 hover:ring-cyan-400 dark:hover:ring-cyan-500';
    return 'bg-cyan-600 dark:bg-cyan-500 hover:ring-2 hover:ring-cyan-500 dark:hover:ring-cyan-400';
  };

  const getFormattedDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if we can navigate to next/prev month
  const canGoNext = monthOffset < 0;
  const canGoPrev = true; // Can always go to past months

  return (
    <div className="flex flex-col gap-6">
      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded-sm bg-slate-100 dark:bg-slate-800" />
          <div className="w-4 h-4 rounded-sm bg-cyan-200 dark:bg-cyan-900" />
          <div className="w-4 h-4 rounded-sm bg-cyan-400 dark:bg-cyan-700" />
          <div className="w-4 h-4 rounded-sm bg-cyan-500 dark:bg-cyan-600" />
          <div className="w-4 h-4 rounded-sm bg-cyan-600 dark:bg-cyan-500" />
        </div>
        <span>More</span>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMonthOffset(monthOffset - 1)}
          disabled={!canGoPrev}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          aria-label="Previous month"
        >
          ← Prev
        </button>

        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {monthData.monthName} {monthData.year}
        </h3>

        <button
          onClick={() => setMonthOffset(monthOffset + 1)}
          disabled={!canGoNext}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          aria-label="Next month"
        >
          Next →
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="flex items-center justify-center font-semibold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide h-7"
          >
            {day[0]}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="rounded-lg bg-transparent h-8"
              />
            );
          }

          return (
            <div
              key={day.date}
              className={`rounded-lg cursor-pointer transition h-8 ${getColor(day.count)} flex items-center justify-center text-center group relative`}
              title={`${getFormattedDate(day.date)}: ${day.count} ${day.count === 1 ? 'completion' : 'completions'}`}
            >
              <span className="font-bold text-sm text-slate-700 dark:text-slate-100 group-hover:font-black leading-none">
                {day.day}
              </span>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 dark:bg-slate-950 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                {getFormattedDate(day.date)}
                <br />
                {day.count} {day.count === 1 ? 'completion' : 'completions'}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-slate-900 dark:border-t-slate-950" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      {maxCompletions > 0 && (
        <div className="text-sm text-slate-600 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p>
            Maximum completions in a day:{' '}
            <span className="font-bold text-slate-900 dark:text-slate-100">{maxCompletions}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CompletionHeatmap;
