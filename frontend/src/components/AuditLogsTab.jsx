import DataTable from "./ui/DataTable";

export default function AuditLogsTab({
  logs,
  logFilter,
  onLogFilterChange,
  onApplyFilters,
}) {
  return (
    <section className="section-stack">
      <section className="panel">
        <h2>Audit Logs</h2>
        <form className="toolbar" onSubmit={onApplyFilters}>
          <select
            value={logFilter.decision}
            onChange={(e) =>
              onLogFilterChange({ ...logFilter, decision: e.target.value })
            }
          >
            <option value="">All decisions</option>
            <option value="ALLOW">ALLOW</option>
            <option value="DENY">DENY</option>
          </select>
          <input
            placeholder="Search user, resource, action, reason"
            value={logFilter.search}
            onChange={(e) =>
              onLogFilterChange({ ...logFilter, search: e.target.value })
            }
          />
          <button type="submit">Filter</button>
        </form>
        <DataTable
          empty="No audit events recorded."
          columns={[
            "Timestamp",
            "User",
            "Resource",
            "Action",
            "Decision",
            "Reason",
            "IP",
          ]}
          rows={logs.map((log) => [
            new Date(log.timestamp).toLocaleString(),
            log.user_name || "System",
            log.resource_name || "-",
            log.action,
            <span className={`pill ${String(log.decision).toLowerCase()}`}>
              {log.decision}
            </span>,
            log.reason || "-",
            log.ip_address || "-",
          ])}
        />
      </section>
    </section>
  );
}
