import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Habit, DailyLog } from '../types';
import { initialHabits, initialLogs } from '../data/mockData';
import { POINTS_PER_LEVEL, MAX_STREAK_BONUS_DAYS, STREAK_BONUS_PER_DAY } from '../constants';
import { getISODateString, areDatesConsecutive } from '../utils/date';

const LOG_STORAGE_KEY = 'discipline-forge-logs';

export const useDisciplineForge = () => {
    const [logs, setLogs] = useState<DailyLog[]>(() => {
        if (typeof window === 'undefined') {
            return initialLogs;
        }
        try {
            const stored = localStorage.getItem(LOG_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as DailyLog[];
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch {
            /* fall back to defaults */
        }
        return initialLogs;
    });
    const [habits] = useState<Habit[]>(initialHabits);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        try {
            localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
        } catch {
            /* ignore quota/storage errors */
        }
    }, [logs]);

    const stats = useMemo(() => {
        // --- Streak Calculation ---
        let streak = 0;
        const completedLogs = logs
            .filter(log => log.completedHabitIds.length > 0)
            .sort((a, b) => b.date.localeCompare(a.date));

        if (completedLogs.length > 0) {
            const todayStr = getISODateString(new Date());
            const yesterdayStr = getISODateString(new Date(Date.now() - 864e5));
            const latestLogDate = completedLogs[0].date;

            if (latestLogDate === todayStr || latestLogDate === yesterdayStr) {
                streak = 1;
                for (let i = 0; i < completedLogs.length - 1; i++) {
                    if (areDatesConsecutive(completedLogs[i].date, completedLogs[i+1].date)) {
                        streak++;
                    } else {
                        break;
                    }
                }
            }
        }

        // --- Points & Level Calculation ---
        let totalPoints = 0;
        logs.forEach(log => {
            log.completedHabitIds.forEach(habitId => {
                const habit = habits.find(h => h.id === habitId);
                if (habit) {
                    totalPoints += habit.points;
                }
            });
        });

        const level = Math.floor(totalPoints / POINTS_PER_LEVEL) + 1;
        const pointsForCurrentLevel = totalPoints % POINTS_PER_LEVEL;

        // --- Today's Points Calculation ---
        const todayLog = logs.find(log => log.date === getISODateString(new Date()));
        const todayBasePoints = todayLog ? todayLog.completedHabitIds.reduce((sum, id) => {
            const habit = habits.find(h => h.id === id);
            return sum + (habit?.points || 0);
        }, 0) : 0;
        
        const streakBonusMultiplier = 1 + Math.min(streak, MAX_STREAK_BONUS_DAYS) * STREAK_BONUS_PER_DAY;
        const todayPointsWithBonus = Math.round(todayBasePoints * streakBonusMultiplier);

        // --- Chart Data Calculation (Last 7 Days) ---
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = getISODateString(date);
            const logForDay = logs.find(log => log.date === dateStr);
            chartData.push({
                name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                completed: logForDay ? logForDay.completedHabitIds.length : 0,
            });
        }

        return {
            level,
            totalPoints,
            streak,
            pointsForCurrentLevel,
            pointsToNextLevel: POINTS_PER_LEVEL,
            todayPoints: todayPointsWithBonus,
            streakBonusMultiplier,
            chartData,
        };
    }, [logs, habits]);

    const toggleHabit = useCallback((habitId: string, dateStr: string = getISODateString(new Date())) => {
        setLogs(currentLogs => {
            const newLogs = [...currentLogs];
            const logIndex = newLogs.findIndex(log => log.date === dateStr);

            if (logIndex > -1) {
                const logToUpdate = { ...newLogs[logIndex] };
                const habitIndex = logToUpdate.completedHabitIds.indexOf(habitId);
                
                if (habitIndex > -1) {
                    logToUpdate.completedHabitIds = logToUpdate.completedHabitIds.filter(id => id !== habitId);
                } else {
                    logToUpdate.completedHabitIds = [...logToUpdate.completedHabitIds, habitId];
                }
                newLogs[logIndex] = logToUpdate;
            } else {
                newLogs.push({ date: dateStr, completedHabitIds: [habitId] });
            }
            return newLogs;
        });
    }, []);

    return { habits, logs, stats, toggleHabit };
};
