import Bar from "./ui/Bar";
import Metric from "./ui/Metric";
import PieChart from "./ui/PieChart";

export default function DashboardTab({ dashboard, maxDayCount, maxDeniedCount }) {
  if (!dashboard) return null;

  const allowedByAction = dashboard.allowedByAction || [];
  const deniedByReason = dashboard.deniedByReason || [];
  const suspiciousByReason = dashboard.suspiciousByReason || [];

  return (
    <section className="section-stack">
      <div className="metric-grid">
        <Metric label="Users" value={dashboard.metrics.total_users} />
        <Metric label="Resources" value={dashboard.metrics.total_resources} />
        <Metric label="Attempts" value={dashboard.metrics.total_attempts} />
        <Metric label="Allowed" value={dashboard.metrics.allowed_attempts} />
        <Metric label="Denied" value={dashboard.metrics.denied_attempts} />
        <Metric label="Suspicious" value={dashboard.metrics.suspicious_attempts} />
      </div>

      <section className="panel two-column">
        <div>
          <h2>Access Requests Per Day</h2>
          <div className="bar-list">
            {dashboard.attemptsByDay.map((item) => (
              <Bar
                key={item.day}
                label={item.day}
                value={item.count}
                max={maxDayCount}
              />
            ))}
          </div>
        </div>
        <div>
          <h2>Denied Requests By Reason</h2>
          <div className="bar-list">
            {deniedByReason.length ? (
              deniedByReason.map((item) => (
                <Bar
                  key={item.reason}
                  label={item.reason}
                  value={item.count}
                  max={maxDeniedCount}
                />
              ))
            ) : (
              <p className="empty-state">No denials recorded.</p>
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Activity Breakdown</h2>
        <div className="chart-row">
          <div className="chart-card">
            <h3>Allowed Activities</h3>
            <PieChart data={allowedByAction} />
          </div>
        </div>
        <div className="chart-row">
          <div className="chart-card">
            <h3>Denial Factors</h3>
            <PieChart data={deniedByReason} />
          </div>
        </div>
        <div className="chart-row">
          <div className="chart-card">
            <h3>Suspicious Activities</h3>
            <PieChart data={suspiciousByReason} />
          </div>
        </div>
      </section>
    </section>
  );
}
