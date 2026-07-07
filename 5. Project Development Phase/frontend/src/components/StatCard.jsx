export default function StatCard({ icon, label, value, color = "blue", subtitle }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__content">
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__label">{label}</div>
        {subtitle && <div className="stat-card__subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}
