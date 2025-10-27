import React, { useState, useEffect, useRef } from 'react';
import type { Habit } from './types';
import { useDisciplineForge } from './hooks/useDisciplineForge';
import { useTheme } from './hooks/useTheme';
import { getISODateString } from './utils/date';
import HabitHistoryChart from './components/HabitHistoryChart';

// --- Icon Components ---

const LevelIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" /></svg>
);
const PointsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
);
const StreakIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>
);
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);
const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);
const GoalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>
);
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);


// --- UI Components ---

interface ThemeToggleProps {
    theme: string;
    toggleTheme: () => void;
}
const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => (
    <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors"
        aria-label="Toggle theme"
    >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
);


interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  className?: string;
}
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, className }) => (
    <div className={`bg-white dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center space-x-4 transition-all duration-300 hover:border-${color}-400/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.2)] ${className || ''}`}>
        <div className={`p-3 rounded-md bg-${color}-500/10 text-${color}-400`}>
            <Icon />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold font-orbitron text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);


interface LevelProgressProps {
  level: number;
  currentPoints: number;
  totalPointsForNextLevel: number;
}
const LevelProgress: React.FC<LevelProgressProps> = ({ level, currentPoints, totalPointsForNextLevel }) => {
    const progress = totalPointsForNextLevel > 0 ? (currentPoints / totalPointsForNextLevel) * 100 : 0;
    return (
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-gray-700 col-span-2 lg:col-span-4 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]">
            <div className="flex justify-between items-center mb-2">
                <span className="font-orbitron text-lg text-cyan-400">Level {level}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{currentPoints} / {totalPointsForNextLevel} XP</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-4 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

interface HabitItemProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: (id: string) => void;
}
const HabitItem: React.FC<HabitItemProps> = ({ habit, isCompleted, onToggle }) => (
    <div className={`flex items-center p-4 rounded-lg transition-all duration-300 ${isCompleted ? 'bg-green-500/10' : 'bg-gray-100 dark:bg-gray-800/80'}`}>
        <div className={`mr-4 ${isCompleted ? 'text-green-400' : 'text-cyan-400'}`}>
           <habit.icon />
        </div>
        <div className="flex-grow">
            <p className={`font-medium text-lg ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>{habit.name}</p>
            <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>+ {habit.points} XP</p>
        </div>
        <button 
            onClick={() => onToggle(habit.id)}
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-green-500 border-green-400 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-cyan-500 text-gray-400 dark:text-gray-600 hover:text-cyan-500'}`}
            aria-label={`Mark ${habit.name} as ${isCompleted ? 'incomplete' : 'complete'}`}
        >
            <CheckIcon />
        </button>
    </div>
);


// --- Main App Component ---

export default function App() {
  const { habits, logs, stats, toggleHabit } = useDisciplineForge();
  const [theme, toggleTheme] = useTheme();
  const [animateStreak, setAnimateStreak] = useState(false);
  const prevStreakRef = useRef(stats.streak);
  const today = getISODateString(new Date());
  const todayLog = logs.find(log => log.date === today);
  
  const [streakGoal, setStreakGoal] = useState<number>(() => {
    const savedGoal = typeof window !== 'undefined' ? localStorage.getItem('streakGoal') : null;
    return savedGoal ? parseInt(savedGoal, 10) : 30;
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState<string>(streakGoal.toString());

  useEffect(() => {
    if (stats.streak > prevStreakRef.current) {
        setAnimateStreak(true);
        const timer = setTimeout(() => setAnimateStreak(false), 600); // Animation duration
        return () => clearTimeout(timer);
    }
    prevStreakRef.current = stats.streak;
  }, [stats.streak]);

  useEffect(() => {
    localStorage.setItem('streakGoal', streakGoal.toString());
  }, [streakGoal]);

  const handleGoalSave = () => {
    const newGoal = parseInt(tempGoal, 10);
    if (!isNaN(newGoal) && newGoal > 0) {
      setStreakGoal(newGoal);
    } else {
      setTempGoal(streakGoal.toString()); // reset if invalid
    }
    setIsEditingGoal(false);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 dark:[background:radial-gradient(circle,_#1a202c,_#111827)]">
      <div className="max-w-4xl mx-auto">
        
        <header className="text-center mb-8 relative">
            <h1 className="text-4xl md:text-5xl font-bold font-orbitron tracking-wider text-cyan-400" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.7)'}}>
                The Discipline Forge
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Harness your will. Forge your destiny.</p>
            <div className="absolute top-0 right-0">
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
        </header>

        <main>
          <section id="dashboard" className="mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={LevelIcon} label="Current Level" value={stats.level} color="cyan" />
                <StatCard icon={PointsIcon} label="Total Points" value={stats.totalPoints.toLocaleString()} color="blue" />
                <StatCard 
                    icon={StreakIcon} 
                    label="Current Streak" 
                    value={`${stats.streak} Days`} 
                    color="green" 
                    className={animateStreak ? 'streak-pop-animation' : ''}
                />
                
                {/* Streak Goal Card */}
                <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between space-x-4 transition-all duration-300 hover:border-yellow-400/50 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                    <div className="flex items-center space-x-4 flex-grow min-w-0">
                        <div className="p-3 rounded-md bg-yellow-500/10 text-yellow-400">
                            <GoalIcon />
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Streak Goal</p>
                            {isEditingGoal ? (
                                <input
                                    type="number"
                                    value={tempGoal}
                                    onChange={(e) => setTempGoal(e.target.value)}
                                    onBlur={handleGoalSave}
                                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                                    className="bg-transparent text-2xl font-bold font-orbitron text-gray-900 dark:text-white w-full focus:outline-none p-0 border-0 ring-0"
                                    autoFocus
                                    onFocus={(e) => e.target.select()}
                                />
                            ) : (
                                <p className="text-2xl font-bold font-orbitron text-gray-900 dark:text-white truncate">{streakGoal} Days</p>
                            )}
                        </div>
                    </div>
                    {!isEditingGoal && (
                        <button 
                            onClick={() => {
                                setTempGoal(streakGoal.toString());
                                setIsEditingGoal(true);
                            }} 
                            className="p-1 flex-shrink-0 rounded-full text-gray-400 hover:text-yellow-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Edit streak goal"
                        >
                            <PencilIcon />
                        </button>
                    )}
                </div>

                <LevelProgress level={stats.level} currentPoints={stats.pointsForCurrentLevel} totalPointsForNextLevel={stats.pointsToNextLevel} />
            </div>
          </section>

          <section id="tracker" className="mb-8">
            <div className="bg-white/80 dark:bg-black/20 backdrop-blur-md p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold font-orbitron">Today's Forge</h2>
                    <div className="text-right">
                        <p className="font-semibold text-lg text-cyan-400">+{stats.todayPoints} XP</p>
                        {stats.streak > 0 && (
                            <p className="text-sm text-green-400">{(stats.streakBonusMultiplier - 1).toLocaleString(undefined, {style: 'percent'})} Streak Bonus</p>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    {habits.map(habit => (
                        <HabitItem 
                            key={habit.id}
                            habit={habit}
                            isCompleted={todayLog?.completedHabitIds.includes(habit.id) ?? false}
                            onToggle={() => toggleHabit(habit.id, today)}
                        />
                    ))}
                </div>
            </div>
          </section>

          <section id="history">
            <div className="bg-white/80 dark:bg-black/20 backdrop-blur-md p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold font-orbitron mb-4">7-Day Activity</h2>
                <div style={{ width: '100%', height: 300 }}>
                    <HabitHistoryChart data={stats.chartData} />
                </div>
            </div>
          </section>
        </main>

        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Discipline Forge. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}