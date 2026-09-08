import { isDoneToday, formatMinutes, recurrenceLabel } from "../lib/taskLogic.js";

export default function TaskRow({ task, goal, overdue, onToggle, onDelete }) {
  const done = isDoneToday(task);

  return (
    <li className={overdue ? "task-row task-row-overdue" : "task-row"}>
      <button
        type="button"
        className="task-check"
        aria-pressed={done}
        onClick={() => onToggle(task.id)}
      >
        <span className={done ? "task-check-icon task-check-icon-done" : "task-check-icon"} aria-hidden="true">
          {done ? "✓" : ""}
        </span>
        <span className="task-copy">
          <span className={done ? "task-title task-title-done" : "task-title"}>{task.title}</span>
          <span className="task-meta">
            {goal ? <span className="task-tag">{goal.title}</span> : null}
            <span className="task-recurrence">{recurrenceLabel(task)}</span>
            {task.estimateMinutes ? <span className="task-estimate">{formatMinutes(task.estimateMinutes)}</span> : null}
            {overdue ? <span className="task-overdue-flag">overdue</span> : null}
          </span>
        </span>
      </button>
      <button
        type="button"
        className="task-delete"
        aria-label={`Delete ${task.title}`}
        onClick={() => onDelete(task.id)}
      >
        ×
      </button>
    </li>
  );
}
