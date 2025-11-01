import React, { useMemo } from 'react';
import type { DailyLog } from '../types';
import { getISODateString, areDatesConsecutive } from '../utils/date';

interface StreakTimelineProps {
  logs: DailyLog[];
}

interface Streak {
  startDate: string;
  endDate: string;
  length: number;
  isCurrent: boolean;
}

const StreakTimeline: React.FC<StreakTimelineProps> = ({ logs }) => {
  const { streaks, currentStreak } = useMemo(() => {
    const completedLogs = logs
      .filter((log) => log.completedHabitIds.length > 0)
      .sort((a, b) => a.date.localeCompare(b.date));

    const streaks: Streak[] = [];
    let currentStreak = 0;

    if (completedLogs.length > 0) {
      let streakStart = completedLogs[0].date;
      let streakLength = 1;

      for (let i = 1; i < completedLogs.length; i++) {
        if (areDatesConsecutive(completedLogs[i - 1].date, completedLogs[i].date)) {
          streakLength++;
        } else {
          streaks.push({
            startDate: streakStart,
            endDate: completedLogs[i - 1].date,
            length: streakLength,
            isCurrent: false,
          });
          streakStart = completedLogs[i].date;
          streakLength = 1;
        }
      }

      // Check if the last streak is current
      const today = getISODateString(new Date());
      const yesterday = getISODateString(new Date(Date.now() - 864e5));
      const isCurrentStreak =
        completedLogs[completedLogs.length - 1].date === today ||
        completedLogs[completedLogs.length - 1].date === yesterday;

      streaks.push({
        startDate: streakStart,
        endDate: completedLogs[completedLogs.length - 1].date,
        length: streakLength,
        isCurrent: isCurrentStreak,
      });

      // Track current streak for display
      if (isCurrentStreak && completedLogs[completedLogs.length - 1].date === today) {
        currentStreak = streakLength;
      }
    }

    return { streaks, currentStreak };
  }, [logs]);

  return (
    <div className="space-y-4">
      {currentStreak > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 p-4">
          <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            🔥 Current Streak: <span className="text-2xl">{currentStreak}</span> days
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Streak History</h4>
        {streaks.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">No streaks yet. Start completing habits!</p>
        ) : (
          <div className="space-y-2">
            {streaks
              .sort((a, b) => b.length - a.length)
              .map((streak, index) => {
                const startDate = new Date(streak.startDate);
                const endDate = new Date(streak.endDate);
                const startStr = startDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
                const endStr = endDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 rounded-lg p-3 ${
                      streak.isCurrent
                        ? 'bg-emerald-100/50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                      {streak.length}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {streak.length === 1 ? '1 day' : `${streak.length} days`}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {startStr} — {endStr}
                        {streak.isCurrent && ' (Active)'}
                      </p>
                    </div>
                    {streak.length >= 7 && (
                      <div className="text-lg">
                        {streak.length >= 30
                          ? '🏆'
                          : streak.length >= 14
                            ? '⭐'
                            : '✨'}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakTimeline;
