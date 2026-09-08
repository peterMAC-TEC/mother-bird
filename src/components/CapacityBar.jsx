import { formatMinutes } from "../lib/taskLogic.js";

const OPTIONS = [
  { value: "", label: "No limit set" },
  { value: "60", label: "1 hr / day" },
  { value: "120", label: "2 hr / day" },
  { value: "180", label: "3 hr / day" },
  { value: "240", label: "4 hr / day" },
  { value: "360", label: "6 hr / day" },
];

export default function CapacityBar({ plannedMinutes, capacityMinutes, onChangeCapacity }) {
  const hasCapacity = typeof capacityMinutes === "number" && capacityMinutes > 0;
  const pct = hasCapacity ? Math.min(100, Math.round((plannedMinutes / capacityMinutes) * 100)) : null;
  const over = hasCapacity && plannedMinutes > capacityMinutes;

  return (
    <div className="capacity-bar">
      <div className="capacity-bar-row">
        <span className="capacity-bar-label">
          {plannedMinutes > 0
            ? `${formatMinutes(plannedMinutes)} planned today`
            : "Nothing time-estimated for today yet"}
        </span>
        <select
          value={capacityMinutes ?? ""}
          onChange={(e) => onChangeCapacity(e.target.value ? Number(e.target.value) : null)}
          aria-label="Daily capacity"
        >
          {OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {hasCapacity && (
        <div className="capacity-track">
          <div className={over ? "capacity-fill capacity-fill-over" : "capacity-fill"} style={{ width: `${pct}%` }} />
        </div>
      )}
      {over && (
        <p className="capacity-warning">
          That's over your {formatMinutes(capacityMinutes)} day — something on today's list might need to move to tomorrow.
        </p>
      )}
    </div>
  );
}
