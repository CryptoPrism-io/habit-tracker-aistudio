import React from 'react';
import './TimePicker.css';

interface TimePickerProps {
  hour?: number;
  minute?: number;
  onChange: (hour: number, minute: number) => void;
  label?: string;
}

export default function TimePicker({
  hour = 0,
  minute = 0,
  onChange,
  label = 'Select Time',
}: TimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(parseInt(e.target.value), minute);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(hour, parseInt(e.target.value));
  };

  const formatTime = (h: number, m: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="time-picker">
      <label className="time-picker-label">{label}</label>

      <div className="time-picker-display">
        <span className="time-display">{formatTime(hour, minute)}</span>
      </div>

      <div className="time-picker-inputs">
        <div className="time-input-group">
          <label htmlFor="hour-select">Hour</label>
          <select
            id="hour-select"
            value={hour}
            onChange={handleHourChange}
            className="time-select"
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {h.toString().padStart(2, '0')} ({h % 12 || 12} {h >= 12 ? 'PM' : 'AM'})
              </option>
            ))}
          </select>
        </div>

        <div className="time-input-group">
          <label htmlFor="minute-select">Minute</label>
          <select
            id="minute-select"
            value={minute}
            onChange={handleMinuteChange}
            className="time-select"
          >
            {minutes.map((m) => (
              <option key={m} value={m}>
                {m.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
