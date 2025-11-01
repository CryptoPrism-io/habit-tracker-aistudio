# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Discipline Forge** is a single-user gamified habit tracker built with React 19, TypeScript, and Vite. It uses local browser storage (localStorage) for persistence and is deployed as a Progressive Web App (PWA) on GitHub Pages. The app features an access gate (code: "1111") and provides a dashboard for tracking daily habits, earning points, building streaks, and visualizing progress.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run smoke test (checks for console errors)
npm run test:smoke
```

## Architecture

### File Structure

The project uses a **flat root-level component architecture** rather than traditional `src/` folder:

- **Root TypeScript files**: `App.tsx`, `index.tsx`, `types.ts`, `constants.ts`
- **Hooks**: `hooks/useDisciplineForge.ts`, `hooks/useTheme.ts`
- **Utils**: `utils/persistence.ts`, `utils/date.ts`
- **Components**: `components/HabitHistoryChart.tsx`
- **Data**: `data/mockData.tsx` (initial habits and logs)
- **Configuration**: `vite.config.ts`, `tsconfig.json`

### Path Aliases

TypeScript path alias `@/*` maps to the repository root (not a src directory):

```typescript
// In vite.config.ts and tsconfig.json
"@/*": ["./*"]
```

When importing, use relative paths (e.g., `./hooks/useDisciplineForge`) or the `@/` alias.

### Core Data Flow

1. **State Management**: The `useDisciplineForge` hook (hooks/useDisciplineForge.ts) is the central state manager:
   - Uses React `useState` with `StoredState` interface
   - Automatically syncs to localStorage via `useEffect`
   - Provides: `habits`, `logs`, `stats`, `history`, and mutation functions
   - Validates and normalizes all habit data against constrained options (see types.ts)

2. **Persistence Layer** (utils/persistence.ts):
   - Storage key: `discipline-forge-state`
   - Migrates legacy `discipline-forge-logs` format
   - Sanitizes and normalizes data on load to ensure constrained values
   - Falls back to default state from `data/mockData.tsx` on first load

3. **Constrained Configuration** (types.ts):
   - All habit values are constrained to predefined options:
     - Points: `[25, 50, 75, 100]`
     - Durations: `[15, 30, 45, 60]` minutes
     - Streak multipliers: `[1, 2, 3]`
     - Icons: `['sunrise', 'lotus', 'torch', 'moon', 'book', 'dumbbell']`
     - Categories: `['sadhana', 'wake_morning', 'evening', 'bedtime', 'learning', 'reflection', 'workout_supplements']`

4. **Stats Calculation** (useDisciplineForge.ts:81-151):
   - **Streak**: Calculated from consecutive days with completed habits
   - **Points**: Base points × streak multiplier, with bonus based on streak length
   - **Level**: Floor(totalPoints / 1000) + 1
   - **Bonus multiplier**: 1 + min(streak, 30) × 0.05 (max 150% at 30-day streak)

### PWA Configuration

- **Service Worker**: Registered in index.tsx using `vite-plugin-pwa`
- **Base Path**: Production uses `/habit-tracker-aistudio/` (GitHub Pages), dev uses `/`
- **Manifest**: Configured in vite.config.ts with offline support
- **Icons**: Located in `public/icons/`

### Theme System

The `useTheme` hook manages dark/light mode:
- Persists to localStorage key: `theme`
- Applies class to `document.documentElement`
- Defaults to system preference if no stored value

## Common Patterns

### Adding New Habit Properties

When adding a new property to habits:

1. Update `Habit` and `HabitDraft` interfaces in `types.ts`
2. Add normalizer function in `utils/persistence.ts` (e.g., `ensureNewProp`)
3. Update `normaliseHabit` function to apply normalizer
4. Update `addHabit` and `updateHabit` in `useDisciplineForge.ts`
5. Update UI forms in `HabitManagerPage` component in `App.tsx`

### Modifying Stats Calculation

Stats are memoized and recalculated on `logs` or `habits` change. Key logic is in `useDisciplineForge.ts:81-151`. Constants are in `constants.ts`:
- `POINTS_PER_LEVEL`: 1000
- `MAX_STREAK_BONUS_DAYS`: 30
- `STREAK_BONUS_PER_DAY`: 0.05

### Working with History

The app stores two data structures:
- **DailyRecord** (in StoredState.history): Detailed entries with timestamps, notes, values
- **DailyLog** (derived): Simple view with just date and completed habit IDs

Always mutate `history` in state; `logs` are derived via `historyToDailyLogs`.

## Deployment

- **Target**: GitHub Pages at `/habit-tracker-aistudio/`
- **Workflow**: `.github/workflows/deploy.yml`
- **Trigger**: Push to `main` branch
- **Build output**: `dist/` directory

The workflow runs `npm ci && npm run build` and deploys to gh-pages branch.

## Access Control

The app has a simple access gate (App.tsx:85-130):
- Access code: `"1111"`
- Storage key: `discipline-forge-access-granted`
- Users must enter code once; it persists in localStorage

## Notes

- No backend or API - all data is client-side
- Uses React Router with routes: `/dashboard`, `/habits`, `/analytics`
- Tailwind CSS is loaded via CDN in `index.html` (not via PostCSS)
- Custom fonts: Orbitron (headings) and Roboto (body)
- Date format is always ISO (YYYY-MM-DD) via `getISODateString` utility
