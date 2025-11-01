# The Discipline Forge - User Guide

**Welcome to The Discipline Forge!** 🚀

Your personal gamified habit tracking system designed to build discipline and achieve consistent progress.

---

## Quick Start (5 Minutes)

### 1. Access the App
Open your browser and visit:
```
https://cryptoprism-io.github.io/habit-tracker-aistudio/
```

### 2. Create Your First Habit
1. Click **"Add Habit"** button on the Dashboard
2. Fill in the habit details:
   - **Name**: e.g., "Morning Meditation"
   - **Category**: Select from 7 options (Sadhana, Wake Morning, Evening, etc.)
   - **Points**: Choose 10, 25, 50, or 100 points
   - **Icon**: Pick an emoji icon
   - **Other fields**: Optional (duration, streak multiplier, tags)
3. Click **"Create"**

### 3. Track Your First Completion
1. On the Dashboard, find your new habit
2. Click the **checkbox** to mark it complete
3. See your **points increase** and **level progress**
4. Build your **streak** by completing habits daily

### 4. View Your Progress
1. Click **"Analytics"** in the navigation
2. Explore your **completion calendar**, **streaks**, and **charts**
3. See patterns in your habit completion

---

## Core Concepts

### Habits
A habit is an activity or action you want to complete regularly.

**Habit Categories** (7 types):
- 🧘 **Sadhana**: Spiritual/meditation practices
- 🌅 **Wake Morning**: Early morning routines
- 🌙 **Evening**: Evening routines
- 🛏️ **Bedtime**: Sleep-related habits
- 📚 **Learning**: Education and skill development
- 🪞 **Reflection**: Journaling and self-reflection
- 💪 **Workout/Supplements**: Exercise and nutrition

**Habit Properties**:
- **Name**: Description of the habit
- **Points**: Base value (10, 25, 50, 100) earned per completion
- **Icon**: Visual representation (emoji)
- **Duration**: Time estimate in minutes (optional)
- **Streak Multiplier**: Bonus multiplier (1x, 1.5x, 2x, 3x)
- **Tags**: Custom labels for organization

### Points System
Points are earned when you complete habits.

**Point Calculation**:
```
Points Earned = Base Points
              × Streak Multiplier
              × Daily Streak Bonus
```

**Daily Streak Bonus** (increases with consecutive days):
- Day 1: 1.0x (1.0 multiplier)
- Day 2: 1.1x
- Day 3: 1.2x
- Day 4: 1.3x
- Day 5+: 1.5x (capped)

**Example**:
```
Habit: "Morning Run" (50 points, 2x multiplier)
Day 1: 50 × 2 × 1.0 = 100 points
Day 2: 50 × 2 × 1.1 = 110 points
Day 5: 50 × 2 × 1.5 = 150 points
```

### Streaks
A **streak** is consecutive days of completing at least one habit.

**How Streaks Work**:
1. Complete at least 1 habit today → Streak continues
2. Miss a day → Streak breaks and resets to 0
3. Streak bonus multiplies all points earned
4. Visible on Dashboard and in Analytics

### Levels
Your **level** represents overall progress.

**Level System**:
- Points Required Per Level: 100 points
- Level 1: 0-99 points
- Level 2: 100-199 points
- Level 3: 200-299 points
- And so on...

**Progress Ring**: Shows your progress toward the next level with:
- Current level number
- Percentage complete
- XP (experience points) display

---

## Dashboard Features

### Overview Stats
- **Current Level**: Your progress indicator
- **Today's Points**: Points earned today
- **Current Streak**: Consecutive days with completions
- **Streak Bonus**: Active multiplier for today

### Daily Habit Checklist
- List of all active habits
- Grouped by category
- Color-coded by category
- Point value shown for each
- Click to mark complete/incomplete

### Quick Actions
- **View Analytics**: See detailed charts and patterns
- **Manage Habits**: Edit, delete, or archive habits
- **Add Note**: Add reflection/notes to completion

---

## Analytics Features

### 1. Category Radial Chart
Shows completion percentage for each habit category.
- **What it shows**: Which categories you're best at
- **Use it to**: Balance your habit categories

### 2. Completion Heatmap
12-month calendar showing your completion patterns.
- **Green intensity**: How many habits completed that day
- **Dark green**: Very productive days
- **Gray**: Days with no completions
- **Use it to**: Spot patterns and gaps

### 3. Time Scatter Plot
Shows what time of day you complete habits.
- **X-axis**: Time of day (0-24 hours)
- **Y-axis**: Day of week
- **Use it to**: Identify optimal completion times

### 4. Streak Timeline
Historical record of your streaks.
- Longest streaks at top
- Shows when streaks occurred
- 🔥 emoji marks current active streak

### 5. Habit Sunburst
All habits visualized by completion count.
- **Box size**: Proportional to completions
- **Color**: By habit category
- **Use it to**: See which habits you complete most

### 6. Habit History (7-Day)
Last 7 days of activity with toggle.
- **Completions View**: How many habits per day
- **Points View**: Points earned per day
- **Use it to**: Track recent performance

---

## Gamification Tips

### Maximize Points
1. **Habit Selection**: Start with habits worth 10 or 25 points
2. **Streak Multiplier**: Set high multipliers (2x, 3x) on difficult habits
3. **Build Streaks**: Complete at least 1 habit every day
4. **Streak Bonus**: After 5 consecutive days, you hit the max 1.5x bonus

### Build Long Streaks
1. Start with **easier habits** to build momentum
2. **Add gradually**: Don't start too many at once
3. **Same time daily**: Pick a consistent time
4. **Track progress**: Review analytics weekly

### Level Up Faster
1. **High-value habits**: Create habits worth 50-100 points
2. **High multipliers**: Use 2x or 3x streak multipliers
3. **Consistency**: Don't break your streak
4. **Strategic completion**: Combine habits on the same day

---

## Navigation Guide

### Main Pages

**Dashboard** (Home)
- View today's habits
- See current stats
- Quick habit completion
- Access is immediate on app open

**Analytics**
- View all 6 charts
- Detailed completion data
- Pattern analysis
- Historical streaks

**Habits**
- Manage all habits
- Create new habits
- Edit existing habits
- Archive/delete habits
- Configure all properties

### Top Navigation
- App logo/name
- Current page indicator
- Theme toggle (Light/Dark mode)
- Navigation links

### Mobile Navigation
- May use hamburger menu
- Optimized for touch
- Same features as desktop

---

## Themes (Light/Dark Mode)

### Light Mode
- White/light gray background
- Dark text for readability
- Good for daytime use
- Bright, energetic feel

### Dark Mode
- Dark slate background
- Light text
- Good for evening use
- Reduced eye strain

### Toggle Theme
Look for the theme toggle button (usually sun/moon icon) in the navigation area.

---

## Data Management

### Automatic Saving
- All data saves to your browser's local storage
- No account required
- No cloud sync (currently)
- Data persists between sessions

### Data Backup
To backup your data:
1. Export via browser's localStorage
2. Save JSON file
3. Keep in safe location

### Data Recovery
If you accidentally delete a habit:
- Soft-deleted habits may be recoverable
- Hard reset clears all data permanently
- Local storage persists unless cleared

---

## PWA Features (Mobile)

### Install on Mobile
1. Visit app on iPhone or Android
2. Look for "Add to Home Screen" option
3. Choose to install app
4. App appears on home screen
5. Launch like native app

### Offline Support
- Works without internet after first visit
- Service worker caches all assets
- Habits and data persist offline
- Syncs when internet returns

### Full-Screen Mode
- No browser chrome
- Looks like native app
- Touch-friendly interface
- Status bar integrated

---

## Keyboard Shortcuts (Desktop)

| Shortcut | Action |
|----------|--------|
| `Tab` | Navigate between elements |
| `Enter` | Select/activate button |
| `Escape` | Close modal or dialog |
| `Space` | Toggle checkbox |

---

## Accessibility Features

### Keyboard Navigation
- All features accessible via keyboard
- Tab order follows logical flow
- No keyboard traps
- Escape to cancel

### Screen Reader Support
- ARIA labels on all buttons
- Form labels associated
- Semantic HTML used
- Status updates announced

### High Contrast
- Sufficient color contrast for readability
- Text and backgrounds distinguishable
- Color not only means of info
- Focus indicators visible

---

## FAQ

### Q: Will my data be stored in the cloud?
**A**: Currently, data is stored locally in your browser only. No cloud sync. You can manually export.

### Q: Can I sync across devices?
**A**: Not currently. Data is stored per device/browser.

### Q: What happens if I clear my browser cache?
**A**: All data will be lost. Backup your data first.

### Q: How do I reset the app?
**A**: Clear browser data/cache for this site. Be careful as this deletes all habits and history.

### Q: Can I use this on my phone?
**A**: Yes! Install it as a PWA (Add to Home Screen). Works on iOS and Android.

### Q: What if I want to export my data?
**A**: Data is stored as JSON in localStorage. Use browser dev tools to export.

### Q: Why do I have different point values?
**A**: Each habit can have custom point values (10, 25, 50, 100). You choose.

### Q: How is my streak calculated?
**A**: Streak = consecutive days with at least 1 completed habit. Breaks if you miss a day.

### Q: Can I edit past completions?
**A**: Yes, you can toggle habits on specific past dates in the Analytics/History section.

---

## Best Practices

### Starting Out
1. **Create 3-5 simple habits** - Don't overload yourself
2. **Pick easy habits first** - Build confidence
3. **Set realistic goals** - 10-25 minutes daily
4. **Track consistently** - Daily logging is key

### Weekly Review
1. Check Analytics page
2. Look for patterns
3. Identify why habits were missed
4. Adjust if needed
5. Celebrate wins!

### Habit Optimization
1. **Too easy**: Increase point value or multiplier
2. **Too hard**: Reduce scope or break into smaller habits
3. **Not doing it**: Pick better time of day
4. **Losing streak**: Add reminder or accountability

### Common Mistakes
- ❌ Creating too many habits at once
- ❌ Setting unrealistic point values
- ❌ Not tracking consistently
- ❌ Ignoring patterns in analytics
- ✅ Start small and build gradually

---

## Troubleshooting

### Problem: Data disappeared
**Solution**: Check if you cleared browser cache. Restore from backup if available.

### Problem: Charts not showing
**Solution**: Ensure you have completion history. New app needs data to display charts.

### Problem: Offline not working
**Solution**: Service worker needs initial page load. Visit once online first.

### Problem: Mobile app not installing
**Solution**: Use "Add to Home Screen" option, ensure HTTPS connection, PWA compatible browser.

### Problem: Dark mode not saving
**Solution**: Check if JavaScript is enabled. Try clearing cache and reloading.

---

## Getting Help

### In-App Help
- Hover over elements for tooltips
- Field labels explain requirements
- Modal dialogs guide through actions

### Browser Console
If experiencing issues:
1. Press `F12` or `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
2. Check Console tab for errors
3. Report errors to support

### Report Issues
- GitHub Issues: [Submit detailed bug report](https://github.com/CryptoPrism-io/habit-tracker-aistudio/issues)
- Include: browser, OS, steps to reproduce, expected vs actual

---

## Gamification Philosophy

**The Discipline Forge** is based on proven habit-building science:

1. **Consistency Over Intensity**: Small daily actions beat sporadic effort
2. **Visual Progress**: Charts and levels provide motivation
3. **Streak Incentive**: Consecutive days build momentum
4. **Reward System**: Points and levels give dopamine hits
5. **Community**: Share streaks and achievements (future)

Remember: The goal is **sustainable habit change**, not just high scores. Focus on consistency, not perfection.

---

## Tips for Success

### Start Small
- 1-3 habits first
- 10 minutes daily
- Easy wins build confidence

### Be Specific
- Not: "Exercise"
- But: "Morning 10-min jog"

### Track Immediately
- Log completion same day
- Don't rely on memory
- See streak build daily

### Review Weekly
- Check analytics
- Celebrate progress
- Adjust if needed

### Stay Consistent
- Same time daily
- Even if imperfect
- Breaks streaks matter

---

## Next Steps

1. **Create first habit** (5 min)
2. **Log completions today** (1 min)
3. **Check dashboard** (2 min)
4. **Review analytics** (5 min)
5. **Plan tomorrow** (2 min)

---

**Version**: 1.0
**Last Updated**: November 1, 2025
**Questions?**: Check GitHub Issues or contact support

**Now go build your discipline! 🚀**
