import { backlogFor, completionByDay, isDueToday, weekdayWeekendInsight } from "../lib/taskLogic.js";
import { todayISO, weekdayLabel } from "../lib/dates.js";
import DataBackup from "./DataBackup.jsx";
import CalendarHeatmap from "./CalendarHeatmap.jsx";

export default function DashboardView({ goals, tasks }) {
  const today = todayISO();
  const dueToday = tasks.filter((t) => isDueToday(t, today));
  const doneToday = dueToday.filter((t) =>
    t.recurrence === "once" ? t.checkIns.length > 0 : t.checkIns.includes(today),
  );
  const backlog = backlogFor(tasks, today);
  const days = completionByDay(tasks, 7, today);
  const maxCount = Math.max(1, ...days.map((d) => d.count));
  const insight = weekdayWeekendInsight(tasks, today);

  return (
    <section>
      <div className="stat-grid">
        <div className="stat-tile">
          <span className="stat-value">{goals.length}</span>
          <span className="stat-label">Goals in motion</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{doneToday.length}/{dueToday.length}</span>
          <span className="stat-label">Done today</span>
        </div>
        <div className={backlog.length > 0 ? "stat-tile stat-tile-warn" : "stat-tile"}>
          <span className="stat-value">{backlog.length}</span>
          <span className="stat-label">Falling behind</span>
        </div>
      </div>

      <h2 className="section-heading">Last 7 days</h2>
      <div className="activity-strip" role="img" aria-label="Tasks completed over the last 7 days">
        {days.map((d) => (
          <div key={d.iso} className="activity-col">
            <div className="activity-bar-track">
              <div className="activity-bar" style={{ height: `${Math.max(6, (d.count / maxCount) * 100)}%` }} />
            </div>
            <span className="activity-count">{d.count}</span>
            <span className="activity-day">{weekdayLabel(d.iso)[0]}</span>
          </div>
        ))}
      </div>

      <h2 className="section-heading">Last 12 weeks</h2>
      <CalendarHeatmap tasks={tasks} />

      <h2 className="section-heading">Patterns</h2>
      {insight ? (
        <p className="insight-line">
          You complete <strong>{insight.weekdayRate}%</strong> of recurring tasks on weekdays,
          vs <strong>{insight.weekendRate}%</strong> on weekends
          {insight.weekendRate < insight.weekdayRate
            ? " — weekends are where things slip. Consider lighter weekend recurrences."
            : " — solid consistency across the week."}
        </p>
      ) : (
        <p className="empty-state">Keep checking things off — patterns show up here after a few days of activity.</p>
      )}

      <h2 className="section-heading">Data</h2>
      <DataBackup />
    </section>
  );
}
