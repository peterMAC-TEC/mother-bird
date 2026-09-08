import { useState } from "react";
import AddTaskForm from "./AddTaskForm.jsx";
import TaskRow from "./TaskRow.jsx";
import { goalProgress } from "../lib/taskLogic.js";

export default function GoalCard({ goal, tasks, onAddTask, onToggle, onDelete, onDeleteGoal }) {
  const [expanded, setExpanded] = useState(false);
  const goalTasks = tasks.filter((t) => t.goalId === goal.id);
  const { done, total, recurringCount } = goalProgress(goal.id, tasks);
  const pct = total > 0 ? Math.round((done / total) * 100) : null;

  return (
    <li className="goal-card">
      <button type="button" className="goal-card-head" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
        <span className="goal-card-title-row">
          <span className="goal-card-title">{goal.title}</span>
          <span className="goal-card-caret" aria-hidden="true">{expanded ? "▾" : "▸"}</span>
        </span>
        {goal.notes && <span className="goal-card-notes">{goal.notes}</span>}
        <span className="goal-progress-track" aria-hidden="true">
          <span className="goal-progress-fill" style={{ width: `${pct ?? 0}%` }} />
        </span>
        <span className="goal-card-stats">
          {total > 0 ? `${done}/${total} checklist tasks done` : "No checklist tasks yet"}
          {recurringCount > 0 && ` · ${recurringCount} recurring`}
        </span>
      </button>

      {expanded && (
        <div className="goal-card-body">
          <AddTaskForm goals={[goal]} defaultGoalId={goal.id} onAddTask={onAddTask} compact />
          {goalTasks.length === 0 ? (
            <p className="empty-state">Break this goal into its first small task above.</p>
          ) : (
            <ul className="task-list">
              {goalTasks.map((task) => (
                <TaskRow key={task.id} task={task} goal={null} overdue={false} onToggle={onToggle} onDelete={onDelete} />
              ))}
            </ul>
          )}
          <button type="button" className="ghost-btn danger-link" onClick={() => onDeleteGoal(goal.id)}>
            Delete this goal and its tasks
          </button>
        </div>
      )}
    </li>
  );
}
