import { addDays, dayOfWeek, isWeekday, lastNDays, todayISO } from "./dates.js";

/** How many tasks were actually completed on a given day (not just "due"). */
function doneCountOn(tasks, iso) {
  return tasks.filter((t) => isDoneOn(t, iso) && (t.recurrence !== "once" || t.checkIns[0] === iso)).length;
}

/**
 * Task shape:
 * {
 *   id, title, goalId (string|null),
 *   recurrence: 'once' | 'daily' | 'weekdays' | 'custom',
 *   recurrenceDays: number[]|null   // 0 (Sun) .. 6 (Sat), only meaningful for 'custom'
 *   dueDate: string|null   // ISO, only meaningful for 'once'
 *   checkIns: string[]     // ISO dates the task was marked done
 *   createdAt: string      // ISO date
 * }
 */

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function isRecurring(task) {
  return task.recurrence === "daily" || task.recurrence === "weekdays" || task.recurrence === "custom";
}

export function isDoneOn(task, iso) {
  if (task.recurrence === "once") return task.checkIns.length > 0;
  return task.checkIns.includes(iso);
}

export function isDoneToday(task, today = todayISO()) {
  return isDoneOn(task, today);
}

function recurrenceAppliesOn(task, iso) {
  if (task.recurrence === "daily") return true;
  if (task.recurrence === "weekdays") return isWeekday(iso);
  if (task.recurrence === "custom") return (task.recurrenceDays || []).includes(dayOfWeek(iso));
  return false;
}

/** Human-readable recurrence, e.g. "Every day" or "Tue, Thu" for a custom schedule. */
export function recurrenceLabel(task) {
  if (task.recurrence === "once") return "One-time";
  if (task.recurrence === "daily") return "Every day";
  if (task.recurrence === "weekdays") return "Weekdays";
  if (task.recurrence === "custom") {
    const days = task.recurrenceDays || [];
    if (days.length === 0) return "Custom";
    return days.slice().sort((a, b) => a - b).map((d) => WEEKDAY_NAMES[d]).join(", ");
  }
  return task.recurrence;
}

/** Should this task appear on the given day's checklist? */
export function isDueOn(task, iso) {
  if (task.recurrence === "once") {
    if (task.checkIns.length > 0) {
      // Stay visible (checked off) for the day it was completed, then drop off the list.
      return task.checkIns[0] === iso;
    }
    if (task.dueDate && task.dueDate > iso) return false; // scheduled for later
    return true;
  }
  return recurrenceAppliesOn(task, iso);
}

export function isDueToday(task, today = todayISO()) {
  return isDueOn(task, today);
}

/** Toggle completion for the given day (today, in practice). */
export function toggledCheckIns(task, iso) {
  if (task.recurrence === "once") {
    return task.checkIns.length > 0 ? [] : [iso];
  }
  return task.checkIns.includes(iso)
    ? task.checkIns.filter((d) => d !== iso)
    : [...task.checkIns, iso];
}

/**
 * Backlog: things slipping behind.
 * - a "once" task whose due date has passed without completion
 * - a recurring task missed on 2+ of the days it was due, over the last 7 days
 */
export function backlogFor(tasks, today = todayISO()) {
  const items = [];

  for (const task of tasks) {
    if (task.recurrence === "once") {
      if (task.checkIns.length === 0 && task.dueDate && task.dueDate < today) {
        items.push({ task, reason: "overdue", since: task.dueDate });
      }
      continue;
    }

    const windowStart = task.createdAt > addDays(today, -6) ? task.createdAt : addDays(today, -6);
    const days = lastNDays(7, addDays(today, -1)).filter((d) => d >= windowStart);
    const missed = days.filter(
      (d) => recurrenceAppliesOn(task, d) && !task.checkIns.includes(d),
    );
    if (missed.length >= 2) {
      items.push({ task, reason: "slipping", missedCount: missed.length });
    }
  }

  return items.sort((a, b) => (a.reason === "overdue" ? -1 : 1));
}

/** Progress for a goal, based on its one-time checklist tasks. */
export function goalProgress(goalId, tasks) {
  const checklistTasks = tasks.filter((t) => t.goalId === goalId && t.recurrence === "once");
  const recurringCount = tasks.filter((t) => t.goalId === goalId && t.recurrence !== "once").length;
  const done = checklistTasks.filter((t) => t.checkIns.length > 0).length;
  return { done, total: checklistTasks.length, recurringCount };
}

/** Tasks completed on each of the last `count` days. */
export function completionByDay(tasks, count = 7, today = todayISO()) {
  const days = lastNDays(count, today);
  return days.map((iso) => ({ iso, count: doneCountOn(tasks, iso) }));
}

/**
 * Completion history laid out as calendar weeks (Sun-first columns), for a heatmap view.
 * Returns an array of week-columns, each an array of 7 cells (`{ iso, count }` or `null`
 * for padding before the range starts / after today) so callers can render a fixed 7-row grid.
 */
export function activityGrid(tasks, weeks = 12, today = todayISO()) {
  const totalDays = weeks * 7;
  const days = lastNDays(totalDays, today);
  const leadingPad = dayOfWeek(days[0]); // 0 (Sun) needs no padding, 6 (Sat) needs 6 cells
  const trailingPad = 6 - dayOfWeek(days[days.length - 1]);

  const cells = [
    ...Array(leadingPad).fill(null),
    ...days.map((iso) => ({ iso, count: doneCountOn(tasks, iso) })),
    ...Array(trailingPad).fill(null),
  ];

  const columns = [];
  for (let i = 0; i < cells.length; i += 7) {
    columns.push(cells.slice(i, i + 7));
  }
  return columns;
}

/** Total estimated minutes across everything due on a given day (whether done yet or not). */
export function plannedMinutesForDay(tasks, iso) {
  return tasks
    .filter((t) => isDueOn(t, iso))
    .reduce((sum, t) => sum + (t.estimateMinutes || 0), 0);
}

export function formatMinutes(minutes) {
  if (!minutes) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Simple weekday-vs-weekend completion insight. Returns null if not enough data yet. */
export function weekdayWeekendInsight(tasks, today = todayISO()) {
  const days = lastNDays(14, today);
  let weekdayDue = 0, weekdayDone = 0, weekendDue = 0, weekendDone = 0;

  for (const iso of days) {
    const bucket = isWeekday(iso) ? "weekday" : "weekend";
    for (const task of tasks) {
      if (task.recurrence === "once") continue; // one-off tasks don't repeat, skip for this stat
      if (!recurrenceAppliesOn(task, iso)) continue;
      if (bucket === "weekday") {
        weekdayDue++;
        if (task.checkIns.includes(iso)) weekdayDone++;
      } else {
        weekendDue++;
        if (task.checkIns.includes(iso)) weekendDone++;
      }
    }
  }

  const totalDone = weekdayDone + weekendDone;
  if (totalDone < 4 || weekdayDue === 0 || weekendDue === 0) return null;

  return {
    weekdayRate: Math.round((weekdayDone / weekdayDue) * 100),
    weekendRate: Math.round((weekendDone / weekendDue) * 100),
  };
}
