import { useState } from "react";
import { todayISO, parseSpokenDate } from "../lib/dates.js";
import VoiceButton from "./VoiceButton.jsx";

const MAX_LENGTH = 100;
const WEEKDAY_OPTIONS = [
  { value: 0, label: "S" },
  { value: 1, label: "M" },
  { value: 2, label: "T" },
  { value: 3, label: "W" },
  { value: 4, label: "T" },
  { value: 5, label: "F" },
  { value: 6, label: "S" },
];

export default function AddTaskForm({ goals, defaultGoalId = "", onAddTask, compact = false }) {
  const [title, setTitle] = useState("");
  const [goalId, setGoalId] = useState(defaultGoalId);
  const [recurrence, setRecurrence] = useState("once");
  const [recurrenceDays, setRecurrenceDays] = useState([]);
  const [dueDate, setDueDate] = useState(todayISO());
  const [dateVoiceError, setDateVoiceError] = useState(null);
  const [estimateMinutes, setEstimateMinutes] = useState("");

  function toggleDay(day) {
    setRecurrenceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b),
    );
  }

  function handleDateVoice(text) {
    const parsed = parseSpokenDate(text, todayISO());
    if (parsed) {
      setDueDate(parsed);
      setDateVoiceError(null);
    } else {
      setDateVoiceError(`Didn't catch a date in "${text}" — try "tomorrow", "next Friday", or "Sept 20"`);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    if (recurrence === "custom" && recurrenceDays.length === 0) return;
    onAddTask({
      title: trimmed,
      goalId: goalId || null,
      recurrence,
      recurrenceDays: recurrence === "custom" ? recurrenceDays : null,
      dueDate: recurrence === "once" ? dueDate : null,
      estimateMinutes: estimateMinutes ? Number(estimateMinutes) : null,
    });
    setTitle("");
    setRecurrenceDays([]);
    setDateVoiceError(null);
  }

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <div className="add-task-row">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_LENGTH}
          placeholder="e.g. Call three suppliers for quotes"
          autoComplete="off"
          aria-label="Task title"
        />
        <VoiceButton onResult={setTitle} label="Dictate task title" />
        <button type="submit">Add</button>
      </div>
      <div className="add-task-options">
        {!defaultGoalId && goals.length > 0 && (
          <select value={goalId} onChange={(e) => setGoalId(e.target.value)} aria-label="Goal">
            <option value="">No goal</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>{goal.title}</option>
            ))}
          </select>
        )}
        <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} aria-label="Repeats">
          <option value="once">One-time</option>
          <option value="daily">Every day</option>
          <option value="weekdays">Weekdays</option>
          <option value="custom">Custom days</option>
        </select>
        {recurrence === "once" && !compact && (
          <span className="date-with-voice">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                setDateVoiceError(null);
              }}
              aria-label="Due date"
            />
            <VoiceButton onResult={handleDateVoice} label="Dictate due date" />
          </span>
        )}
        <select value={estimateMinutes} onChange={(e) => setEstimateMinutes(e.target.value)} aria-label="Time estimate">
          <option value="">No estimate</option>
          <option value="15">15 min</option>
          <option value="30">30 min</option>
          <option value="60">1 hr</option>
          <option value="120">2 hr</option>
          <option value="240">4 hr</option>
        </select>
      </div>
      {dateVoiceError && <p className="field-hint-error">{dateVoiceError}</p>}
      {recurrence === "custom" && (
        <div className="weekday-picker" role="group" aria-label="Days of the week">
          {WEEKDAY_OPTIONS.map((day) => (
            <button
              key={day.value}
              type="button"
              className={recurrenceDays.includes(day.value) ? "weekday-btn weekday-btn-active" : "weekday-btn"}
              aria-pressed={recurrenceDays.includes(day.value)}
              onClick={() => toggleDay(day.value)}
            >
              {day.label}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
