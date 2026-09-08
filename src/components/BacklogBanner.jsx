export default function BacklogBanner({ items, onToggle }) {
  if (items.length === 0) return null;

  const visible = items.slice(0, 4);
  const extra = items.length - visible.length;

  return (
    <div className="backlog-banner" role="status">
      <p className="backlog-headline">
        {items.length === 1
          ? "1 task is falling behind"
          : `${items.length} tasks are falling behind`}
      </p>
      <ul className="backlog-list">
        {visible.map(({ task, reason, since, missedCount }) => (
          <li key={task.id} className="backlog-item">
            <span className="backlog-item-title">{task.title}</span>
            <span className="backlog-item-reason">
              {reason === "overdue" ? `overdue since ${since}` : `missed ${missedCount} of the last 7 days`}
            </span>
            <button type="button" onClick={() => onToggle(task.id)}>Mark done</button>
          </li>
        ))}
      </ul>
      {extra > 0 && <p className="backlog-more">+{extra} more piling up</p>}
    </div>
  );
}
