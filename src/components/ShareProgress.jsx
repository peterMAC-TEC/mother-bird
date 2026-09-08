import { useState } from "react";
import { buildShareSnapshot, buildShareURL } from "../lib/shareLink.js";

export default function ShareProgress({ goals, tasks }) {
  const [link, setLink] = useState(null);
  const [copyStatus, setCopyStatus] = useState(null);

  function handleGenerate() {
    const snapshot = buildShareSnapshot(goals, tasks);
    setLink(buildShareURL(snapshot));
    setCopyStatus(null);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopyStatus("Copied!");
    } catch {
      setCopyStatus("Couldn't copy automatically — select the link and copy it manually.");
    }
  }

  return (
    <div className="share-progress">
      <p className="data-backup-hint">
        Generate a read-only link showing your goal titles and progress — no task details, no
        KPIs. Anyone with the link can view it, no login, and can't edit anything.
      </p>
      <div className="data-backup-actions">
        <button type="button" className="ghost-btn-outline" onClick={handleGenerate} disabled={goals.length === 0}>
          Generate share link
        </button>
      </div>
      {goals.length === 0 && <p className="data-backup-status">Add a goal first — there's nothing to share yet.</p>}
      {link && (
        <div className="share-link-row">
          <input type="text" readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Share link" />
          <button type="button" className="ghost-btn-outline" onClick={handleCopy}>Copy</button>
        </div>
      )}
      {copyStatus && <p className="data-backup-status">{copyStatus}</p>}
    </div>
  );
}
