import AddKPIForm from "./AddKPIForm.jsx";
import KPICard from "./KPICard.jsx";

export default function KPIsView({ kpis, onAddKPI, onLogValue, onDelete }) {
  return (
    <section>
      <p className="view-date">The numbers that actually matter</p>
      <AddKPIForm onAddKPI={onAddKPI} />
      {kpis.length === 0 ? (
        <p className="empty-state">Track something concrete about the business — revenue, signups, units shipped, calls made — and watch it move over time.</p>
      ) : (
        <ul className="kpi-list">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} onLogValue={onLogValue} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </section>
  );
}
