import React, { useMemo } from 'react';
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

interface MonthData {
  month: number;
  year: number;
  days: CalendarDay[];
  monthName: string;
}

const CompletionHeatmap: React.FC<CompletionHeatmapProps> = ({ logs }) => {
  const { monthsData, maxCompletions } = useMemo(() => {
    const logsMap = new Map<string, number>();

    logs.forEach((log) => {
      logsMap.set(log.date, log.completedHabitIds.length);
    });

    // Generate 12 months of data starting from 12 months ago
    const months: MonthData[] = [];
    let max = 0;

    for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
      const date = new Date();
      date.setMonth(date.getMonth() - monthOffset);

      const month = date.getMonth();
      const year = date.getFullYear();
      const monthDays: CalendarDay[] = [];

      // Get the first day of the month
      const firstDay = new Date(year, month, 1);
      // Get the last day of the month
      const lastDay = new Date(year, month + 1, 0);

      // Add padding for days from previous month
      const startingDayOfWeek = firstDay.getDay();

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

      months.push({
        month,
        year,
        days: monthDays,
        monthName: MONTH_NAMES[month],
      });
    }

    return { monthsData: months, maxCompletions: max };
  }, [logs]);

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

  if (monthsData.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-slate-200/70 bg-white/70 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        No completion data available
      </div>
    );
  }

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

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="flex flex-col gap-8" style={{ minWidth: 'max-content' }}>
          {monthsData.map((monthData) => {
            // Build the calendar grid for the month
            const firstDay = new Date(monthData.year, monthData.month, 1);
            const lastDay = new Date(monthData.year, monthData.month + 1, 0);
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

            return (
              <div key={`${monthData.year}-${monthData.month}`} className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {monthData.monthName} {monthData.year}
                </h3>

                <div className="flex gap-2">
                  {/* Day of week labels */}
                  <div className="flex flex-col gap-1 pt-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {DAY_NAMES.map((day) => (
                      <div key={day} className="w-6 h-4 flex items-center justify-center">
                        {day[0]}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="flex gap-1">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day, dayIndex) => {
                          if (!day) {
                            return (
                              <div
                                key={`empty-${dayIndex}`}
                                className="w-4 h-4 rounded-sm"
                              />
                            );
                          }
                          return (
                            <div
                              key={day.date}
                              className={`w-4 h-4 rounded-sm cursor-pointer transition hover:ring-2 hover:ring-offset-1 ${getColor(day.count)}`}
                              title={`${getFormattedDate(day.date)}: ${day.count} ${day.count === 1 ? 'completion' : 'completions'}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
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
