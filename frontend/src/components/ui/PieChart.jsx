export default function PieChart({ data }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <p className="empty-state">No data available.</p>;
  }

  const total = data.reduce((sum, item) => sum + Number(item.count || 0), 0);
  
  if (total === 0) {
    return <p className="empty-state">No data available.</p>;
  }

  const colors = [
    '#ff5d73',
    '#ffcc66',
    '#5bb8ff',
    '#21d4a4',
    '#a855f7',
    '#f97316',
    '#ec4899',
    '#14b8a6',
  ];

  let cumulativePercent = 0;
  const segments = data.map((item, index) => {
    const count = Number(item.count || 0);
    const percent = (count / total) * 100;
    const segment = {
      ...item,
      count,
      percent,
      color: colors[index % colors.length],
      startPercent: cumulativePercent,
      endPercent: cumulativePercent + percent,
    };
    cumulativePercent += percent;
    return segment;
  });

  return (
    <div className="pie-chart-container">
      <div className="pie-chart-wrapper">
        <svg viewBox="0 0 100 100" className="pie-chart">
          {segments.map((segment, index) => {
            const startAngle = (segment.startPercent / 100) * 360 - 90;
            const endAngle = (segment.endPercent / 100) * 360 - 90;
            const largeArcFlag = segment.percent > 50 ? 1 : 0;
            
            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

            if (segment.percent === 100) {
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill={segment.color}
                />
              );
            }

            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={segment.color}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
            );
          })}
          <circle cx="50" cy="50" r="25" fill="rgba(8, 17, 31, 0.9)" />
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dy="0.3em"
            fill="#edf7ff"
            fontSize="12"
            fontWeight="bold"
          >
            {total}
          </text>
        </svg>
      </div>
      <div className="pie-legend">
        {segments.map((segment, index) => (
          <div key={index} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: segment.color }}
            />
            <div className="legend-label">
              <span className="legend-name">{segment.reason || segment.action || 'Unknown'}</span>
              <span className="legend-value">
                {segment.count} ({segment.percent.toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
