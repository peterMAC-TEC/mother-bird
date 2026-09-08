import { ALL_KEYS } from "./storage.js";
import { todayISO } from "./dates.js";

const SNAPSHOT_VERSION = 1;

/** Read all four forge-flow:* keys straight from localStorage into one plain object. */
export function buildSnapshot() {
  const data = {};
  for (const key of ALL_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        // skip a corrupted key rather than fail the whole export
      }
    }
  }
  return { version: SNAPSHOT_VERSION, exportedAt: todayISO(), data };
}

export function downloadSnapshot() {
  const snapshot = buildSnapshot();
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mother-bird-backup-${todayISO()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Parse and sanity-check a file's contents. Throws with a user-facing message on bad input. */
export function parseSnapshot(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  if (!parsed || typeof parsed !== "object" || typeof parsed.data !== "object" || parsed.data === null) {
    throw new Error("That doesn't look like a Mother Bird backup file.");
  }
  return parsed;
}

/** Overwrite the four forge-flow:* keys from a parsed snapshot. */
export function restoreSnapshot(snapshot) {
  for (const key of ALL_KEYS) {
    if (snapshot.data[key] !== undefined) {
      localStorage.setItem(key, JSON.stringify(snapshot.data[key]));
    }
  }
}
