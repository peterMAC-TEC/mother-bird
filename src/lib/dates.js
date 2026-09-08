export function todayISO() {
  return toISO(new Date());
}

export function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(iso, delta) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return toISO(date);
}

export function dayOfWeek(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay(); // 0 = Sunday .. 6 = Saturday
}

export function isWeekday(iso) {
  const dow = dayOfWeek(iso);
  return dow >= 1 && dow <= 5;
}

export function formatShort(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function weekdayLabel(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

export function monthLabel(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { month: "short" });
}

/** Last `count` ISO dates ending today, oldest first. */
export function lastNDays(count, today = todayISO()) {
  const days = [];
  for (let i = count - 1; i >= 0; i--) {
    days.push(addDays(today, -i));
  }
  return days;
}

const WEEKDAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const WORD_NUMBERS = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

function wordToNumber(token) {
  if (/^\d+$/.test(token)) return Number(token);
  return WORD_NUMBERS[token] ?? null;
}

/** Nearest date (today or later) whose weekday matches `targetDow`; rolls to next week if today already matches. */
function nextWeekdayOn(today, targetDow) {
  const delta = (targetDow - dayOfWeek(today) + 7) % 7;
  return addDays(today, delta === 0 ? 7 : delta);
}

/** This year's occurrence of month/day, or next year's if that date has already passed. */
function nearestYearFor(today, monthIndex, day) {
  const [y] = today.split("-").map(Number);
  const candidate = toISO(new Date(y, monthIndex, day));
  return candidate >= today ? candidate : toISO(new Date(y + 1, monthIndex, day));
}

/**
 * Best-effort parse of a short spoken date phrase into an ISO date string.
 * Handles: today/tomorrow/yesterday, "in N days/weeks", "next week", weekday names
 * (e.g. "next Friday" and bare "Friday" both mean the nearest upcoming Friday),
 * "<month> <day>" / "<day> [of] <month>", and numeric "M/D". Returns null if nothing
 * recognizable was found — this is pattern-matching, not full NLU, so unusual
 * phrasing (e.g. "the day after next Tuesday") won't parse.
 */
export function parseSpokenDate(text, today = todayISO()) {
  const t = text.trim().toLowerCase();
  if (!t) return null;

  if (/\btoday\b/.test(t)) return today;
  if (/\btomorrow\b/.test(t)) return addDays(today, 1);
  if (/\byesterday\b/.test(t)) return addDays(today, -1);

  const relMatch = t.match(/\bin\s+(\d+|[a-z]+)\s+(day|week)s?\b/);
  if (relMatch) {
    const n = wordToNumber(relMatch[1]);
    if (n !== null) return addDays(today, relMatch[2] === "week" ? n * 7 : n);
  }
  if (/\bnext week\b/.test(t)) return addDays(today, 7);

  for (let i = 0; i < WEEKDAY_NAMES.length; i++) {
    if (t.includes(WEEKDAY_NAMES[i])) return nextWeekdayOn(today, i);
  }

  for (let i = 0; i < MONTH_NAMES.length; i++) {
    const stem = MONTH_NAMES[i].slice(0, 3);
    const afterMonth = t.match(new RegExp(`\\b${stem}[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`));
    const beforeMonth = t.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?${stem}[a-z]*\\b`));
    const m = afterMonth || beforeMonth;
    if (m) {
      const day = Number(m[1]);
      if (day >= 1 && day <= 31) return nearestYearFor(today, i, day);
    }
  }

  const numeric = t.match(/\b(\d{1,2})[/-](\d{1,2})\b/);
  if (numeric) {
    const month = Number(numeric[1]) - 1;
    const day = Number(numeric[2]);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) return nearestYearFor(today, month, day);
  }

  return null;
}
