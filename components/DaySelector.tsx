import React from 'react';
import './DaySelector.css';

interface DaySelectorProps {
  activeDays: number[];
  onChange: (days: number[]) => void;
  label?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DaySelector({
  activeDays,
  onChange,
  label = 'Active Days',
}: DaySelectorProps) {
  const toggleDay = (day: number) => {
    if (activeDays.includes(day)) {
      onChange(activeDays.filter((d) => d !== day));
    } else {
      onChange([...activeDays, day].sort());
    }
  };

  const selectAllDays = () => {
    onChange([0, 1, 2, 3, 4, 5, 6]);
  };

  const selectWeekdays = () => {
    onChange([1, 2, 3, 4, 5]);
  };

  const selectWeekends = () => {
    onChange([0, 6]);
  };

  return (
    <div className="day-selector">
      <label className="day-selector-label">{label}</label>

      <div className="day-selector-buttons">
        {DAYS.map((day, index) => (
          <button
            key={index}
            type="button"
            onClick={() => toggleDay(index)}
            title={DAY_FULL_NAMES[index]}
            className={`day-button ${activeDays.includes(index) ? 'active' : ''}`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="day-selector-quick-selects">
        <button
          type="button"
          onClick={selectAllDays}
          className="quick-select-button all-days"
          title="Select all days"
        >
          All Days
        </button>
        <button
          type="button"
          onClick={selectWeekdays}
          className="quick-select-button weekdays"
          title="Select Monday through Friday"
        >
          Weekdays
        </button>
        <button
          type="button"
          onClick={selectWeekends}
          className="quick-select-button weekends"
          title="Select Saturday and Sunday"
        >
          Weekends
        </button>
      </div>

      {activeDays.length > 0 ? (
        <div className="day-selector-display">
          <span className="days-active-label">Active:</span>
          <span className="days-active-text">
            {activeDays.map((d) => DAY_FULL_NAMES[d]).join(', ')}
          </span>
        </div>
      ) : (
        <div className="day-selector-warning">Select at least one day</div>
      )}
    </div>
  );
}
