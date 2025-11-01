# The Discipline Forge - Comprehensive Test Sheet

**Application**: The Discipline Forge - Gamified Habit Tracker
**Version**: 1.0.0
**Test Date**: November 1, 2025
**Platforms to Test**: Desktop (Chrome, Firefox, Safari), Mobile (iOS Safari, Chrome Android), Dark Mode, Light Mode

---

## 1. HABIT MANAGEMENT

### 1.1 Create New Habit
- [ ] Navigate to Habits page
- [ ] Click "Add Habit" button
- [ ] Modal appears with empty form
- [ ] Fill in habit name (e.g., "Morning Meditation")
- [ ] Select category from dropdown (sadhana, wake_morning, evening, bedtime, learning, reflection, workout_supplements)
- [ ] Set points value (10, 25, 50, 100)
- [ ] Select icon from available options
- [ ] Enter duration in minutes (optional)
- [ ] Set streak multiplier (1x, 1.5x, 2x, 3x)
- [ ] Enter target window (optional time range)
- [ ] Add description/tags (comma-separated)
- [ ] Click "Create" button
- [ ] Habit appears in list with correct icon and category
- [ ] Modal closes
- [ ] Habit is saved to localStorage

### 1.2 Edit Existing Habit
- [ ] Click "Edit" on any habit
- [ ] Modal opens with pre-filled values
- [ ] All fields are editable
- [ ] Change name, category, points, etc.
- [ ] Click "Save" button
- [ ] Changes are reflected immediately in habit list
- [ ] Updated timestamp is saved
- [ ] Changes persist on page reload

### 1.3 Delete/Archive Habit
- [ ] Click delete/archive icon on habit
- [ ] Confirmation dialog appears with warning
- [ ] Dialog shows habit name and notes about deletion
- [ ] Cancel button closes dialog without deleting
- [ ] Confirm button removes habit from active list
- [ ] Archived habit is no longer visible in habit list
- [ ] Data is preserved in localStorage (soft delete)

### 1.4 Habit Properties Configuration
- [ ] **Name**: Custom text, required field, non-empty validation
- [ ] **Category**: Dropdown with 7 options, color-coded
- [ ] **Points**: 10, 25, 50, or 100 points per completion
- [ ] **Icon**: Emoji icon selector with visual preview
- [ ] **Duration**: Optional minutes field (number input)
- [ ] **Streak Multiplier**: 1x, 1.5x, 2x, 3x bonus multiplier
- [ ] **Target Window**: Optional time range
- [ ] **Description**: Optional text field for notes
- [ ] **Tags**: Comma-separated values, trimmed and validated

---

## 2. DAILY HABIT TRACKING

### 2.1 Toggle Habit Completion
- [ ] Navigate to Dashboard/Home page
- [ ] See list of all active habits
- [ ] Each habit shows icon, name, and points value
- [ ] Click checkbox/button to mark habit as complete
- [ ] Habit gets visual feedback (checked, highlighted)
- [ ] Points are added to today's total (visible in dashboard stats)
- [ ] Click again to uncheck/remove completion
- [ ] Points are removed from today's total
- [ ] Today's date is recorded in history

### 2.2 Add Notes to Completion
- [ ] While marking habit complete, option to add note appears
- [ ] Click "Add Note" or similar
- [ ] Modal opens for entering reflection/note
- [ ] Type custom note text
- [ ] Save note with completion
- [ ] Note is associated with habit and date in localStorage

### 2.3 Log Past Habit Completions
- [ ] On Dashboard, access calendar or history section
- [ ] Select a past date
- [ ] Toggle habits completed on that date
- [ ] Changes apply to selected date, not today
- [ ] History is correctly recorded with date

### 2.4 Daily Stats Display
- [ ] **Today's Points**: Shows current day's earned points
- [ ] **Streak Counter**: Displays current active streak (only if today's habits logged)
- [ ] **Streak Bonus**: Shows multiplier bonus (1 + streak_days * 0.1)
- [ ] **Habits Completed**: Count of habits completed today
- [ ] **Level**: Displays current level (floor(totalPoints / 100) + 1)
- [ ] **Progress Ring**: Circular indicator showing progress to next level

---

## 3. GAMIFICATION SYSTEM

### 3.1 Points Calculation
- [ ] Habit worth 10 points earns 10 base points
- [ ] Habit worth 25 points earns 25 base points
- [ ] Habit worth 50 points earns 50 base points
- [ ] Habit worth 100 points earns 100 base points
- [ ] **Streak Multiplier Applied**: Base points × habit.streakMultiplier
- [ ] **Daily Streak Bonus Applied**: Points × (1 + min(streak_days, 5) × 0.1)
- [ ] Total = base_points × streak_multiplier × daily_streak_bonus
- [ ] Example: 50 points × 2x multiplier × 1.2 (2-day streak) = 120 points

### 3.2 Streak System
- [ ] Streak only starts/continues if today's habits are logged
- [ ] If no habits logged today, streak breaks
- [ ] Streak = consecutive days with at least 1 completed habit
- [ ] **Streak Bonus**: 1 + min(streak_days, 5) × 0.1 (cap at 1.5x)
- [ ] Streak is counted from today backwards
- [ ] Broken streak resets to 0
- [ ] Example: Day 1 = 1.1x, Day 5 = 1.5x (capped)

### 3.3 Level Progression
- [ ] **Base Level**: floor(totalPoints / 100) + 1
- [ ] Minimum level is always 1
- [ ] Points required per level: 100 points
- [ ] Level 1: 0-99 points
- [ ] Level 2: 100-199 points
- [ ] Level 3: 200-299 points
- [ ] Progress displayed as percentage within current level
- [ ] Progress ring shows visual indicator of next level

### 3.4 Level Progress Ring
- [ ] Circular SVG display shows current level
- [ ] **Label Format**: "Lv [number]" (e.g., "Lv 3")
- [ ] Percentage shown below level (e.g., "45%")
- [ ] XP displayed as "[current] / [total]" format
- [ ] Shows "XP to next level" below
- [ ] Gradient fills from 0% to current progress
- [ ] Smooth animation on progress updates

---

## 4. ANALYTICS & CHARTS

### 4.1 Category Radial Chart
- [ ] Navigate to Analytics page
- [ ] Radial chart displays completion percentage by category
- [ ] **Data**: % of completed habits in each category
- [ ] **Colors**: Each category has assigned color
- [ ] **Legend**: Shows category names, horizontal layout at bottom
- [ ] Sorted by completion percentage (highest first)
- [ ] Filters out empty categories
- [ ] Tooltip shows completion %, count
- [ ] Works in both light and dark modes

### 4.2 Completion Heatmap (12-Month Calendar)
- [ ] **12-Month View**: Shows Jan-Dec of current year
- [ ] **Month Labels**: "Jan 2025", "Feb 2025", etc.
- [ ] **Day-of-Week Labels**: S, M, T, W, T, F, S on left side
- [ ] **Box Size**: 4×4px (16×16px including spacing)
- [ ] **Color Intensity**:
  - [ ] Gray: 0 completions
  - [ ] Light cyan: 1-25% of max
  - [ ] Medium cyan: 26-50% of max
  - [ ] Dark cyan: 51-75% of max
  - [ ] Darkest cyan: 76-100% of max
- [ ] **Tooltips**: "Mon, Nov 1, 2025: 3 completions"
- [ ] **Legend**: Shows color scale with "Less" and "More" labels
- [ ] **Stats**: Displays max completions in a day at bottom
- [ ] Properly handles leap years and month boundaries
- [ ] Responsive on mobile (horizontal scroll if needed)

### 4.3 Time Scatter Plot
- [ ] **X-Axis**: Time of day (0-24 hours, labeled as 0:00, 1:00, etc.)
- [ ] **Y-Axis**: Day of week (Sun-Sat)
- [ ] **Data Points**: Scatter plot showing completion times
- [ ] **Colors**: Each category has distinct color
- [ ] **Legend**: Shows categories, positioned horizontally at bottom
- [ ] **Tooltip**: Hover shows habit name, exact time, day of week
- [ ] Identifies when habits are typically completed
- [ ] Shows time patterns across week
- [ ] No overlap between legend and chart

### 4.4 Streak Timeline
- [ ] Displays historical streaks with milestones
- [ ] Current/active streak highlighted with 🔥 emoji
- [ ] Shows streak lengths and dates
- [ ] Sorted by streak length (longest first)
- [ ] Displays at least 5 historical streaks
- [ ] Shows when streaks started and ended

### 4.5 Habit Sunburst (Treemap)
- [ ] Displays all habits as rectangular blocks
- [ ] **Size**: Proportional to number of completions
- [ ] **Color**: By habit category
- [ ] **Labels**: Habit name and completion count visible on boxes
- [ ] **Interaction**: Hover shows full details
- [ ] Larger boxes = more completed habits
- [ ] Tooltip shows habit name and completion count
- [ ] Each category has distinct color

### 4.6 Habit History Chart (7-Day)
- [ ] Shows last 7 days of data (Mon-Sun)
- [ ] **Toggle View**: Switch between "Completions" and "Points"
- [ ] **Completions View**: Line/area chart showing habits completed per day
- [ ] **Points View**: Line/area chart showing points earned per day
- [ ] **Gradient Fill**: Visual emphasis on data
- [ ] **Tooltip**: Shows date and value on hover
- [ ] **Grid**: Light grid lines for readability
- [ ] Both views work without page reload

---

## 5. USER INTERFACE & UX

### 5.1 Light Mode
- [ ] Default or toggle-able light theme
- [ ] **Background**: White/light gray
- [ ] **Text**: Dark text (slate-900)
- [ ] **Cards**: Light backgrounds with subtle shadows
- [ ] **Buttons**: Cyan accent color
- [ ] **Inputs**: Light backgrounds with border
- [ ] **Charts**: Light color schemes
- [ ] Good contrast ratio for accessibility
- [ ] All elements readable

### 5.2 Dark Mode
- [ ] Toggle or automatic based on system preference
- [ ] **Background**: Dark slate (slate-900)
- [ ] **Cards**: Darker slate with subtle borders
- [ ] **Text**: Light text (slate-100)
- [ ] **Accent**: Cyan maintains good contrast
- [ ] **Charts**: Dark-themed colors
- [ ] All text readable on dark backgrounds
- [ ] Reduced eye strain

### 5.3 Responsive Design
- [ ] **Desktop (1920x1080)**: Full layout, all features visible
- [ ] **Tablet (768x1024)**: Sidebar collapses, responsive grid
- [ ] **Mobile (375x667)**: Single column, touch-friendly
- [ ] Charts stack vertically on mobile
- [ ] Forms are readable on small screens
- [ ] Buttons are touch-friendly (44px+ height)
- [ ] No horizontal scrolling except for calendar
- [ ] Navigation is accessible on all sizes

### 5.4 Dashboard Page
- [ ] **Header**: Shows current date
- [ ] **Level Progress Ring**: Circular level display with XP
- [ ] **Quick Stats**:
  - [ ] Today's points earned
  - [ ] Current streak
  - [ ] Streak bonus multiplier
  - [ ] Habits completed today
- [ ] **Habit List**: All active habits grouped by category
- [ ] **Color Coding**: Each category has distinct color
- [ ] **Today's View**: Only shows current day's habits
- [ ] Icons displayed for each habit
- [ ] Points value shown for each habit

### 5.5 Analytics Page
- [ ] All 6 chart components visible
- [ ] Proper spacing and layout
- [ ] Charts load without lag
- [ ] Legend overlays not blocking data
- [ ] Mobile: Charts stack vertically
- [ ] Charts are interactive (hover, tooltips)
- [ ] No console errors

### 5.6 Habits Configuration Page
- [ ] List of all habits with edit/delete options
- [ ] Can create new habits from this page
- [ ] Filter by category (optional)
- [ ] Sort options (by name, points, category)
- [ ] Quick view of habit properties
- [ ] Archive icon available for each habit

### 5.7 Navigation
- [ ] Top navigation or sidebar menu
- [ ] Links to Dashboard, Analytics, Habits
- [ ] Active page is highlighted
- [ ] Logo/app name visible
- [ ] Mobile: Hamburger menu or bottom nav
- [ ] Quick navigation between pages
- [ ] No broken links

### 5.8 Dialogs & Modals
- [ ] **Create Habit**: Form modal with all fields
- [ ] **Edit Habit**: Pre-filled with existing values
- [ ] **Delete Confirmation**: Shows habit name, asks for confirmation
- [ ] **Add Note**: Text area for reflection
- [ ] All modals have cancel/close option
- [ ] Form validation and error messages
- [ ] Modals are centered and visible

---

## 6. DATA PERSISTENCE

### 6.1 Local Storage
- [ ] All data saved to localStorage
- [ ] Persists after page refresh
- [ ] Persists after browser close
- [ ] Data structure:
  - [ ] `habits`: Array of habit objects
  - [ ] `history`: Object with date keys
- [ ] Handles missing properties gracefully
- [ ] Migration from old format if needed

### 6.2 History Recording
- [ ] Each completion recorded with date
- [ ] Timestamp recorded for each completion
- [ ] Notes associated with completion
- [ ] Multiple completions same day recorded
- [ ] Past dates can be edited
- [ ] History is never lost (soft delete only)

### 6.3 Data Export (Optional)
- [ ] Ability to export data (JSON)
- [ ] Data includes all habits and history
- [ ] Can be used for backup
- [ ] Can be imported (basic support)

---

## 7. PWA & INSTALLATION

### 7.1 Web App Manifest
- [ ] Installable on mobile and desktop
- [ ] App name: "The Discipline Forge"
- [ ] App icon displayed
- [ ] Splash screen shows on launch
- [ ] Theme color applied

### 7.2 Service Worker
- [ ] PWA works offline after first visit
- [ ] Assets cached properly
- [ ] Updates available when new version deployed
- [ ] No network errors when offline
- [ ] Data persisted even offline

### 7.3 Installation
- [ ] "Install App" prompt appears on mobile
- [ ] Can add to home screen
- [ ] Launches fullscreen on mobile
- [ ] Window controls available
- [ ] Can uninstall normally

---

## 8. ACCESSIBILITY

### 8.1 Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] No keyboard traps

### 8.2 Screen Reader Support
- [ ] ARIA labels on buttons
- [ ] Form labels associated with inputs
- [ ] Role attributes present
- [ ] Alert/status roles for updates
- [ ] Semantic HTML used

### 8.3 Color Contrast
- [ ] Text contrast ratio ≥ 4.5:1 (normal text)
- [ ] Button contrast ratio ≥ 4.5:1
- [ ] Chart colors distinguishable without relying on color alone

### 8.4 Focus Indicators
- [ ] Clear focus outlines on all focusable elements
- [ ] Focus visible on keyboard navigation
- [ ] Focus not obscured by other elements

---

## 9. PERFORMANCE

### 9.1 Bundle Size
- [ ] Minified JS: <300KB
- [ ] Gzipped JS: <100KB
- [ ] Main bundle: 83.84KB (gzipped)
- [ ] No unused dependencies

### 9.2 Page Load
- [ ] Dashboard loads within 2 seconds
- [ ] Analytics loads within 3 seconds
- [ ] Charts render smoothly
- [ ] No layout shift (CLS < 0.1)

### 9.3 Interactions
- [ ] Habit toggle completes instantly
- [ ] Chart updates without lag
- [ ] Modals open/close smoothly
- [ ] No janky animations

---

## 10. CROSS-BROWSER TESTING

### 10.1 Chrome/Chromium
- [ ] All features work
- [ ] No console errors
- [ ] Charts render correctly
- [ ] Responsive design works

### 10.2 Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Charts render correctly
- [ ] Dark mode works

### 10.3 Safari (macOS)
- [ ] All features work
- [ ] localStorage works
- [ ] Charts render
- [ ] PWA installable

### 10.4 Safari (iOS)
- [ ] All features work
- [ ] Add to home screen works
- [ ] Responsive design works
- [ ] Touch interactions work

### 10.5 Chrome Android
- [ ] All features work
- [ ] Install app works
- [ ] Responsive design works
- [ ] Touch interactions responsive

---

## 11. BUG FIXES VERIFICATION

### 11.1 LevelProgressRing Font Size ✅
- [ ] "Lv" label displays as small text
- [ ] Level number displays as larger text
- [ ] Proper alignment and spacing
- [ ] Percentage shows below
- [ ] Works in dark/light modes

### 11.2 CategoryRadialChart Legend ✅
- [ ] Legend positioned at bottom
- [ ] No overlap with chart
- [ ] Horizontal layout
- [ ] Categories clearly labeled
- [ ] Works on mobile

### 11.3 TimeScatterPlot Legend ✅
- [ ] Legend at bottom, not overlapping
- [ ] Proper spacing from chart
- [ ] Horizontal layout
- [ ] Categories clearly visible
- [ ] Works on narrow screens

### 11.4 HabitSunburst Rendering ✅
- [ ] Treemap displays all habits
- [ ] No blank space
- [ ] Colors by category
- [ ] Sizes by completion count
- [ ] Tooltips work

### 11.5 CompletionHeatmap Calendar ✅
- [ ] 12-month view displays
- [ ] Month labels visible
- [ ] Day labels (S,M,T,W,T,F,S) visible
- [ ] Proper box sizing
- [ ] Color intensity working
- [ ] Tooltips show full date
- [ ] Works on mobile with scroll

---

## 12. PRODUCTION DEPLOYMENT

### 12.1 GitHub Pages
- [ ] Repository set to public
- [ ] GitHub Pages enabled
- [ ] App accessible at `https://[username].github.io/habit-tracker-aistudio/`
- [ ] Build runs automatically on push
- [ ] Latest version deployed

### 12.2 Routing
- [ ] BaseName set to `/habit-tracker-aistudio/`
- [ ] All routes work (Dashboard, Analytics, Habits)
- [ ] Deep links work correctly
- [ ] No 404 errors on navigation
- [ ] Refresh doesn't break routing

### 12.3 Assets
- [ ] CSS loads correctly
- [ ] Tailwind CDN loads
- [ ] Chart libraries load
- [ ] Icons load
- [ ] Images load (if any)

### 12.4 Service Worker
- [ ] SW registers on production
- [ ] Assets cached for offline
- [ ] Updates work
- [ ] No console warnings

---

## TEST EXECUTION SUMMARY

| Feature Area | Status | Notes |
|---|---|---|
| Habit Management | ⬜ | To be tested |
| Daily Tracking | ⬜ | To be tested |
| Gamification | ⬜ | To be tested |
| Analytics Charts | ⬜ | To be tested |
| UI/UX | ⬜ | To be tested |
| Persistence | ⬜ | To be tested |
| PWA Features | ⬜ | To be tested |
| Accessibility | ⬜ | To be tested |
| Performance | ⬜ | To be tested |
| Cross-Browser | ⬜ | To be tested |
| Bug Fixes | ⬜ | To be tested |
| Production | ⬜ | To be tested |

---

## TESTING NOTES

**Tester**: _________________ **Date**: _________________ **Environment**: _________________

**Issues Found**:
```
[List any bugs or issues discovered]
```

**Notes**:
```
[General observations and feedback]
```

**Overall Result**: ⬜ PASS / ⬜ FAIL / ⬜ PASS WITH ISSUES

---

**Test Sheet Version**: 1.0
**Last Updated**: November 1, 2025
