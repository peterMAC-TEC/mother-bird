import { useState } from "react";
import { latestEntry, trend, sparklinePoints } from "../lib/kpiLogic.js";
import { todayISO } from "../lib/dates.js";
import { extractNumber } from "../lib/voice.js";
import VoiceButton from "./VoiceButton.jsx";

export default function KPICard({ kpi, onLogValue, onDelete }) {
  const [value, setValue] = useState("");
  const latest = latestEntry(kpi);
  const t = trend(kpi);
  const points = sparklinePoints(kpi);

  function handleSubmit(e) {
    e.preventDefault();
    if (value === "") return;
    onLogValue(kpi.id, todayISO(), Number(value));
    setValue("");
  }

  return (
    <li className="kpi-card">
      <div className="kpi-card-head">
        <span className="kpi-card-name">{kpi.name}</span>
        <button type="button" className="task-delete" aria-label={`Stop tracking ${kpi.name}`} onClick={() => onDelete(kpi.id)}>×</button>
      </div>

      <div className="kpi-card-body">
        <div className="kpi-value-block">
          <span className="kpi-value">{latest ? latest.value : "—"}</span>
          {kpi.unit && <span className="kpi-unit">{kpi.unit}</span>}
          {t && t.deltaPct !== null && (
            <span className={t.deltaPct >= 0 ? "kpi-delta kpi-delta-up" : "kpi-delta kpi-delta-down"}>
              {t.deltaPct >= 0 ? "▲" : "▼"} {Math.abs(t.deltaPct)}%
            </span>
          )}
        </div>
        {points ? (
          <svg className="kpi-sparkline" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
            <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="kpi-sparkline-empty">Log a couple more entries to see a trend</span>
        )}
      </div>

      <form className="kpi-log-form" onSubmit={handleSubmit}>
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Today's value${kpi.unit ? ` (${kpi.unit})` : ""}`}
          aria-label={`Log today's ${kpi.name}`}
        />
        <VoiceButton onResult={(text) => setValue(extractNumber(text))} label={`Dictate today's ${kpi.name}`} />
        <button type="submit">Log</button>
      </form>
    </li>
  );
}
