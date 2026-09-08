import { useState } from "react";
import VoiceButton from "./VoiceButton.jsx";

export default function AddKPIForm({ onAddKPI }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddKPI({ name: trimmed, unit: unit.trim() });
    setName("");
    setUnit("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button type="button" className="add-goal-trigger" onClick={() => setOpen(true)}>
        + Track a new metric
      </button>
    );
  }

  return (
    <form className="add-kpi-form" onSubmit={handleSubmit}>
      <div className="field-with-voice">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Weekly revenue"
          aria-label="Metric name"
          autoFocus
        />
        <VoiceButton onResult={setName} label="Dictate metric name" />
      </div>
      <input
        type="text"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        placeholder="Unit (optional) — $, signups, units"
        aria-label="Unit"
      />
      <div className="add-goal-actions">
        <button type="submit">Start tracking</button>
        <button type="button" className="ghost-btn" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
