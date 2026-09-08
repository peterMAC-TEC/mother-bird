import { useState } from "react";
import { GOAL_TEMPLATES } from "../lib/goalTemplates.js";
import VoiceButton from "./VoiceButton.jsx";

const MAX_LENGTH = 100;

export default function AddGoalForm({ onAddGoal, onUseTemplate }) {
  const [mode, setMode] = useState("closed"); // 'closed' | 'templates' | 'custom'
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAddGoal({ title: trimmed, notes: notes.trim() });
    setTitle("");
    setNotes("");
    setMode("closed");
  }

  function handleTemplate(template) {
    onUseTemplate(template);
    setMode("closed");
  }

  if (mode === "closed") {
    return (
      <button type="button" className="add-goal-trigger" onClick={() => setMode("templates")}>
        + New long-term goal
      </button>
    );
  }

  if (mode === "templates") {
    return (
      <div className="template-picker">
        <p className="template-picker-hint">Start from a founder template, or write your own.</p>
        <div className="template-grid">
          {GOAL_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              className="template-card"
              onClick={() => handleTemplate(template)}
            >
              <span className="template-card-title">{template.title}</span>
              <span className="template-card-notes">{template.notes}</span>
              <span className="template-card-count">{template.tasks.length} starter tasks</span>
            </button>
          ))}
        </div>
        <div className="template-picker-actions">
          <button type="button" className="ghost-btn" onClick={() => setMode("custom")}>Start from scratch</button>
          <button type="button" className="ghost-btn" onClick={() => setMode("closed")}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <form className="add-goal-form" onSubmit={handleSubmit}>
      <div className="field-with-voice">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_LENGTH}
          placeholder="e.g. Get first 10 paying customers"
          autoComplete="off"
          aria-label="Goal title"
          autoFocus
        />
        <VoiceButton onResult={setTitle} label="Dictate goal title" />
      </div>
      <div className="field-with-voice">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes — why this matters, target date, anything you'd forget otherwise"
          rows={2}
          aria-label="Goal notes"
        />
        <VoiceButton onResult={setNotes} label="Dictate goal notes" />
      </div>
      <div className="add-goal-actions">
        <button type="submit">Save goal</button>
        <button type="button" className="ghost-btn" onClick={() => setMode("closed")}>Cancel</button>
      </div>
    </form>
  );
}
