import { activityGrid } from "../lib/taskLogic.js";
import { monthLabel } from "../lib/dates.js";

const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function levelFor(count, maxCount) {
  if (count === 0 || maxCount === 0) return 0;
  return Math.min(4, Math.ceil((count / maxCount) * 4));
}

/** Flattens weekday-label column + week columns into one sequence for a column-major CSS grid. */
function buildGridItems(columns, maxCount) {
  const items = [{ kind: "spacer" }];
  for (const label of WEEKDAY_LABELS) {
    items.push({ kind: "weekday-label", text: label });
  }

  let lastMonth = null;
  for (const column of columns) {
    const firstCell = column.find(Boolean);
    const month = firstCell ? monthLabel(firstCell.iso) : null;
    const showMonth = month && month !== lastMonth;
    if (showMonth) lastMonth = month;
    items.push({ kind: "month-label", text: showMonth ? month : "" });

    for (const cell of column) {
      items.push(
        cell
          ? { kind: "cell", level: levelFor(cell.count, maxCount), title: `${cell.iso}: ${cell.count} completed` }
          : { kind: "pad" },
      );
    }
  }
  return items;
}

export default function CalendarHeatmap({ tasks, weeks = 12 }) {
  const columns = activityGrid(tasks, weeks);
  const maxCount = Math.max(0, ...columns.flat().filter(Boolean).map((c) => c.count));
  const items = buildGridItems(columns, maxCount);

  return (
    <div className="heatmap">
      <div className="heatmap-grid" style={{ gridTemplateRows: "14px repeat(7, 12px)" }}>
        {items.map((item, i) => {
          if (item.kind === "spacer") return <span key={i} />;
          if (item.kind === "weekday-label") return <span key={i} className="heatmap-weekday-label">{item.text}</span>;
          if (item.kind === "month-label") return <span key={i} className="heatmap-month-label">{item.text}</span>;
          if (item.kind === "pad") return <span key={i} className="heatmap-cell heatmap-cell-pad" />;
          return <span key={i} className={`heatmap-cell heatmap-cell-${item.level}`} title={item.title} />;
        })}
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={`heatmap-cell heatmap-cell-${level}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
