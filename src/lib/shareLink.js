import { goalProgress } from "./taskLogic.js";
import { todayISO } from "./dates.js";

const SNAPSHOT_VERSION = 1;
const HASH_PREFIX = "#share=";

function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded) {
  let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Goal titles + progress only — no task text, no KPIs. */
export function buildShareSnapshot(goals, tasks) {
  return {
    v: SNAPSHOT_VERSION,
    generatedAt: todayISO(),
    goals: goals.map((goal) => {
      const { done, total } = goalProgress(goal.id, tasks);
      return {
        title: goal.title,
        done,
        total,
        pct: total > 0 ? Math.round((done / total) * 100) : null,
      };
    }),
  };
}

export function encodeShareSnapshot(snapshot) {
  return toBase64Url(JSON.stringify(snapshot));
}

export function buildShareURL(snapshot) {
  const origin = window.location.origin + window.location.pathname;
  return `${origin}${HASH_PREFIX}${encodeShareSnapshot(snapshot)}`;
}

/** Returns the decoded snapshot if the current hash carries one, else null. Never throws. */
export function readShareSnapshotFromHash(hash) {
  if (!hash || !hash.startsWith(HASH_PREFIX)) return null;
  try {
    const encoded = hash.slice(HASH_PREFIX.length);
    const snapshot = JSON.parse(fromBase64Url(encoded));
    if (!snapshot || !Array.isArray(snapshot.goals)) return null;
    return snapshot;
  } catch {
    return null;
  }
}
