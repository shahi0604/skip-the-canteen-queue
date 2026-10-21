export default function StatCard({ icon: Icon, label, value, tone = 'green' }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <span className="stat-icon">
        <Icon size={20} />
      </span>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
