export default function Bar({ label, value, max }) {
  return (
    <div className="bar-row">
      <span>{label}</span>
      <div className="bar-track">
        <div style={{ width: `${(Number(value) / max) * 100}%` }} />
      </div>
      <b>{value}</b>
    </div>
  );
}
