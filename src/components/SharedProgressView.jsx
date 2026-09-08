export default function SharedProgressView({ snapshot }) {
  return (
    <main className="app">
      <header className="app-header">
        <h1>Mother Bird</h1>
        <p className="app-tagline">Shared progress snapshot — read only</p>
      </header>

      <p className="view-date">As of {snapshot.generatedAt}</p>

      {snapshot.goals.length === 0 ? (
        <p className="empty-state">This founder hasn't added any goals yet.</p>
      ) : (
        <ul className="goal-list">
          {snapshot.goals.map((goal, i) => (
            <li key={i} className="goal-card">
              <div className="goal-card-head" style={{ cursor: "default" }}>
                <span className="goal-card-title-row">
                  <span className="goal-card-title">{goal.title}</span>
                </span>
                <span className="goal-progress-track" aria-hidden="true">
                  <span className="goal-progress-fill" style={{ width: `${goal.pct ?? 0}%` }} />
                </span>
                <span className="goal-card-stats">
                  {goal.total > 0 ? `${goal.done}/${goal.total} checklist tasks done` : "No checklist tasks yet"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="empty-state share-view-footer">
        This is a read-only snapshot — nothing here can be edited from this link.
      </p>
    </main>
  );
}
