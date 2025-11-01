import React, { useMemo } from 'react';

interface LevelProgressRingProps {
  level: number;
  pointsForCurrentLevel: number;
  pointsToNextLevel: number;
}

const LevelProgressRing: React.FC<LevelProgressRingProps> = ({
  level,
  pointsForCurrentLevel,
  pointsToNextLevel,
}) => {
  const progressPercentage = useMemo(() => {
    if (pointsToNextLevel === 0) return 0;
    return (pointsForCurrentLevel / pointsToNextLevel) * 100;
  }, [pointsForCurrentLevel, pointsToNextLevel]);

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48">
        <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="45"
            stroke="#e2e8f0"
            strokeWidth="8"
            fill="none"
            className="dark:stroke-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="45"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">Lv {level}</div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            {progressPercentage.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* XP Info */}
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {pointsForCurrentLevel.toLocaleString()} / {pointsToNextLevel.toLocaleString()} XP
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {(pointsToNextLevel - pointsForCurrentLevel).toLocaleString()} XP to next level
        </p>
      </div>
    </div>
  );
};

export default LevelProgressRing;
