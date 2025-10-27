import type React from 'react';

export interface Habit {
  id: string;
  name: string;
  points: number;
  icon: React.ElementType;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  completedHabitIds: string[];
}
