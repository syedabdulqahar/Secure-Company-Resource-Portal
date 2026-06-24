export default function Metric({ label, value }) {
  return (
    <div className="metric">
      <strong>{value ?? 0}</strong>
      <span>{label}</span>
    </div>
  );
}
