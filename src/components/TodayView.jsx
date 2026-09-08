import AddTaskForm from "./AddTaskForm.jsx";
import TaskRow from "./TaskRow.jsx";
import BacklogBanner from "./BacklogBanner.jsx";
import CapacityBar from "./CapacityBar.jsx";
import { backlogFor, isDueToday, plannedMinutesForDay } from "../lib/taskLogic.js";
import { todayISO, weekdayLabel, formatShort } from "../lib/dates.js";

export default function TodayView({ goals, tasks, settings, onAddTask, onToggle, onDelete, onChangeCapacity }) {
  const today = todayISO();
  const dueToday = tasks.filter((t) => isDueToday(t, today));
  const backlog = backlogFor(tasks, today);
  const goalById = Object.fromEntries(goals.map((g) => [g.id, g]));
  const overdueIds = new Set(
    backlog.filter((b) => b.reason === "overdue").map((b) => b.task.id),
  );
  const plannedMinutes = plannedMinutesForDay(tasks, today);

  return (
    <section>
      <p className="view-date">{weekdayLabel(today)}, {formatShort(today)}</p>
      <BacklogBanner items={backlog} onToggle={onToggle} />
      <CapacityBar
        plannedMinutes={plannedMinutes}
        capacityMinutes={settings.capacityMinutes}
        onChangeCapacity={onChangeCapacity}
      />
      <AddTaskForm goals={goals} onAddTask={onAddTask} />
      {dueToday.length === 0 ? (
        <p className="empty-state">Nothing on your plate today — add a task above or check your Goals tab.</p>
      ) : (
        <ul className="task-list">
          {dueToday.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              goal={task.goalId ? goalById[task.goalId] : null}
              overdue={overdueIds.has(task.id)}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
