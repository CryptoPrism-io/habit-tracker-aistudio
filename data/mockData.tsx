import type { Habit, DailyLog } from '../types';
import { getISODateString } from '../utils/date';

const buildTimestamp = () => new Date().toISOString();

const createdTimestamp = buildTimestamp();

export const initialHabits: Habit[] = [
  {
    id: 'sadhana-flow',
    name: 'Sadhana Flow',
    category: 'sadhana',
    points: 75,
    iconKey: 'lotus',
    description: 'Guided yoga, breathwork, and mantra sequence before sunrise.',
    durationMinutes: 45,
    tags: ['mindfulness', 'discipline'],
    streakMultiplier: 2,
    active: true,
    createdAt: createdTimestamp,
    updatedAt: createdTimestamp,
  },
  {
    id: 'sunrise-ritual',
    name: 'Sunrise Ritual',
    category: 'wake_morning',
    points: 50,
    iconKey: 'sunrise',
    description: 'Wake before 6 AM, hydrate, and complete a short gratitude check-in.',
    durationMinutes: 15,
    tags: ['discipline', 'gratitude'],
    streakMultiplier: 1,
    active: true,
    createdAt: createdTimestamp,
    updatedAt: createdTimestamp,
  },
  {
    id: 'evening-reset',
    name: 'Evening Reset',
    category: 'evening',
    points: 25,
    iconKey: 'torch',
    description: 'Tidy work surfaces, dim lights, and set intentions for tomorrow evening.',
    durationMinutes: 15,
    tags: ['planning', 'recovery'],
    streakMultiplier: 1,
    active: true,
    createdAt: createdTimestamp,
    updatedAt: createdTimestamp,
  },
  {
    id: 'bedtime-journal',
    name: 'Bedtime Journal',
    category: 'bedtime',
    points: 25,
    iconKey: 'moon',
    description: '15-minute digital sunset and journal reflection before lights out.',
    durationMinutes: 30,
    tags: ['sleep', 'reflection'],
    streakMultiplier: 1,
    active: true,
    createdAt: createdTimestamp,
    updatedAt: createdTimestamp,
  },
  {
    id: 'learning-sprint',
    name: 'Learning Sprint',
    category: 'learning',
    points: 75,
    iconKey: 'book',
    description: '45-minute deep study session on a growth topic.',
    durationMinutes: 45,
    tags: ['learning', 'focus'],
    streakMultiplier: 2,
    active: true,
    createdAt: createdTimestamp,
    updatedAt: createdTimestamp,
  },
  {
    id: 'strength-stack',
    name: 'Workout & Supplements',
    category: 'workout_supplements',
    points: 100,
    iconKey: 'dumbbell',
    description: '60-minute strength training plus post-session supplementation.',
    durationMinutes: 60,
    tags: ['strength', 'nutrition'],
    streakMultiplier: 3,
    active: true,
    createdAt: createdTimestamp,
    updatedAt: createdTimestamp,
  },
];

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

export const initialLogs: DailyLog[] = [
  { date: getISODateString(twoDaysAgo), completedHabitIds: ['sadhana-flow', 'sunrise-ritual', 'strength-stack'] },
  { date: getISODateString(yesterday), completedHabitIds: ['learning-sprint', 'evening-reset', 'bedtime-journal'] },
];
