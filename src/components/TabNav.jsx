const TABS = [
  { id: "today", label: "Today", icon: "✓" },
  { id: "goals", label: "Goals", icon: "◆" },
  { id: "kpis", label: "KPIs", icon: "◷" },
  { id: "expenses", label: "Spend", icon: "₹" },
  { id: "dashboard", label: "Metrics", icon: "▤" },
];

export default function TabNav({ active, onChange }) {
  return (
    <nav className="tab-nav" aria-label="Sections">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={tab.id === active ? "tab-btn tab-btn-active" : "tab-btn"}
          aria-current={tab.id === active ? "page" : undefined}
          onClick={() => onChange(tab.id)}
        >
          <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
