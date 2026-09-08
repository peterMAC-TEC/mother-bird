/**
 * KPI shape:
 * { id, name, unit (string, optional), entries: [{ date: ISO, value: number }], createdAt }
 * `entries` is kept sorted ascending by date, at most one entry per date.
 */

export function upsertEntry(kpi, iso, value) {
  const withoutDate = kpi.entries.filter((e) => e.date !== iso);
  const entries = [...withoutDate, { date: iso, value }].sort((a, b) => (a.date < b.date ? -1 : 1));
  return { ...kpi, entries };
}

export function latestEntry(kpi) {
  return kpi.entries.length ? kpi.entries[kpi.entries.length - 1] : null;
}

export function trend(kpi) {
  const n = kpi.entries.length;
  if (n === 0) return null;
  const latest = kpi.entries[n - 1];
  if (n === 1) return { latest: latest.value, previous: null, deltaPct: null };
  const previous = kpi.entries[n - 2];
  const deltaPct = previous.value === 0 ? null : Math.round(((latest.value - previous.value) / Math.abs(previous.value)) * 100);
  return { latest: latest.value, previous: previous.value, deltaPct };
}

/** Scaled points for an inline SVG polyline, using the KPI's last `count` entries. */
export function sparklinePoints(kpi, count = 10, width = 100, height = 30) {
  const entries = kpi.entries.slice(-count);
  if (entries.length < 2) return null;

  const values = entries.map((e) => e.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  return entries
    .map((e, i) => {
      const x = (i / (entries.length - 1)) * width;
      const y = height - ((e.value - min) / span) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
