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
  dayOfWeek: number;
  displayDate: Date;
}

const CompletionHeatmap: React.FC<CompletionHeatmapProps> = ({ logs }) => {
  // State for currently selected month
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month, -1 = last month, etc.

  const { monthData, maxCompletions } = useMemo(() => {
    const logsMap = new Map<string, number>();

    logs.forEach((log) => {
      logsMap.set(log.date, log.completedHabitIds.length);
    });

    // Get the month to display
    const displayDate = new Date();
    displayDate.setMonth(displayDate.getMonth() + monthOffset);

    const month = displayDate.getMonth();
    const year = displayDate.getFullYear();
    const monthDays: CalendarDay[] = [];
    let max = 0;

    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Fill in days from this month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const cellDate = new Date(year, month, day);
      const dateStr = getISODateString(cellDate);
      const count = logsMap.get(dateStr) || 0;
      max = Math.max(max, count);

      monthDays.push({
        date: dateStr,
        count,
        dayOfWeek: cellDate.getDay(),
        displayDate: cellDate,
      });
    }

    return { monthData: { month, year, days: monthDays, monthName: MONTH_NAMES[month] }, maxCompletions: max };
  }, [logs, monthOffset]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700';
    const intensity = Math.min(count / Math.max(maxCompletions, 1), 1);
    if (intensity < 0.25) return 'bg-cyan-200 dark:bg-cyan-900 hover:ring-cyan-300 dark:hover:ring-cyan-700';
    if (intensity < 0.5) return 'bg-cyan-400 dark:bg-cyan-700 hover:ring-cyan-400 dark:hover:ring-cyan-600';
    if (intensity < 0.75) return 'bg-cyan-500 dark:bg-cyan-600 hover:ring-cyan-400 dark:hover:ring-cyan-500';
    return 'bg-cyan-600 dark:bg-cyan-500 hover:ring-cyan-500 dark:hover:ring-cyan-400';
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

  // Build the calendar grid for the month
  const firstDay = new Date(monthData.year, monthData.month, 1);
  const startingDayOfWeek = firstDay.getDay();

  // Create a 2D grid: 7 rows (days of week) x multiple columns (weeks)
  const weeks: (CalendarDay | null)[][] = [];
  let currentWeek: (CalendarDay | null)[] = Array(startingDayOfWeek).fill(null);

  monthData.days.forEach((day) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });

  // Fill the last week with empty slots
  while (currentWeek.length < 7) {
    currentWeek.push(null);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Check if we can navigate to next/prev month
  const today = new Date();
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
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous month"
        >
          ← Prev
        </button>

        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          {monthData.monthName} {monthData.year}
        </h3>

        <button
          onClick={() => setMonthOffset(monthOffset + 1)}
          disabled={!canGoNext}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next month"
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="w-full">
        <div className="flex gap-2">
          {/* Day of week labels */}
          <div className="flex flex-col gap-1 pt-6 text-xs font-medium text-slate-500 dark:text-slate-400">
            {DAY_NAMES.map((day) => (
              <div key={day} className="w-8 h-6 flex items-center justify-center">
                {day[0]}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="flex gap-1 flex-wrap content-start">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return (
                      <div
                        key={`empty-${dayIndex}`}
                        className="w-6 h-6 rounded-sm"
                      />
                    );
                  }
                  return (
                    <div
                      key={day.date}
                      className={`w-6 h-6 rounded-sm cursor-pointer transition hover:ring-2 hover:ring-offset-1 ${getColor(day.count)}`}
                      title={`${getFormattedDate(day.date)}: ${day.count} ${day.count === 1 ? 'completion' : 'completions'}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      {maxCompletions > 0 && (
        <div className="text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p>Maximum completions in a day: <span className="font-semibold text-slate-700 dark:text-slate-300">{maxCompletions}</span></p>
        </div>
      )}
    </div>
  );
};

export default CompletionHeatmap;
