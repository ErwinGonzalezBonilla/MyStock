export default function StatCard({ title, value, subtitle }) {
  return (
    <div className="stat-card">

      <h6 className="stat-card-title">
        {title}
      </h6>

      <h2 className="stat-card-value">
        {value}
      </h2>

      <small className="stat-card-subtitle">
        {subtitle}
      </small>

    </div>
  );
}