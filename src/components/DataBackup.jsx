import { useRef, useState } from "react";
import { downloadSnapshot, parseSnapshot, restoreSnapshot } from "../lib/backup.js";

export default function DataBackup() {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState(null); // { kind: 'ok' | 'error', message }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const snapshot = parseSnapshot(reader.result);
        const ok = window.confirm(
          "Importing will replace all current Mother Bird data (goals, tasks, KPIs, settings) with the contents of this file. Continue?",
        );
        if (!ok) return;
        restoreSnapshot(snapshot);
        window.location.reload();
      } catch (err) {
        setStatus({ kind: "error", message: err.message });
      }
    };
    reader.onerror = () => setStatus({ kind: "error", message: "Couldn't read that file." });
    reader.readAsText(file);
  }

  return (
    <div className="data-backup">
      <p className="data-backup-hint">
        Everything here lives only in this browser. Export a backup so a cleared cache or a new
        device doesn't lose it.
      </p>
      <div className="data-backup-actions">
        <button type="button" className="ghost-btn-outline" onClick={downloadSnapshot}>
          Export backup (.json)
        </button>
        <button type="button" className="ghost-btn-outline" onClick={handleImportClick}>
          Import backup
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          hidden
        />
      </div>
      {status && (
        <p className={status.kind === "error" ? "data-backup-status data-backup-status-error" : "data-backup-status"}>
          {status.message}
        </p>
      )}
    </div>
  );
}
