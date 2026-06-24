export default function LoginScreen({
  email,
  password,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) {
  return (
    <main className="login-shell">
      <section className="login-card">
        <div>
          <p className="eyebrow">CS3723 Database Security</p>
          <h1>RBAC + ABAC Portal</h1>
        </div>
        <form onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        {error && <p className="message error">{error}</p>}
        <div
          className="sample-accounts"
          style={{ fontSize: "0.78rem", opacity: 0.85, lineHeight: 1.7 }}
        >
          <strong>🔑 Demo Accounts :</strong>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "0.4rem",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                <th style={{ textAlign: "left", padding: "2px 6px" }}>Email</th>
                <th style={{ textAlign: "left", padding: "2px 6px" }}>
                  Password
                </th>
                <th style={{ textAlign: "left", padding: "2px 6px" }}>
                  Role / Dept
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "2px 6px" }}>admin@company.com</td>
                <td style={{ padding: "2px 6px" }}>Admin123!</td>
                <td style={{ padding: "2px 6px" }}>Admin / IT (L5)</td>
              </tr>
              <tr>
                <td style={{ padding: "2px 6px" }}>manager@company.com</td>
                <td style={{ padding: "2px 6px" }}>Manager123!</td>
                <td style={{ padding: "2px 6px" }}>Manager / IT (L4)</td>
              </tr>
              <tr>
                <td style={{ padding: "2px 6px" }}>hr_manager@company.com</td>
                <td style={{ padding: "2px 6px" }}>Manager123!</td>
                <td style={{ padding: "2px 6px" }}>Manager / HR (L4)</td>
              </tr>
              <tr>
                <td style={{ padding: "2px 6px" }}>
                  finance_manager@company.com
                </td>
                <td style={{ padding: "2px 6px" }}>Manager123!</td>
                <td style={{ padding: "2px 6px" }}>Manager / Finance (L4)</td>
              </tr>
              <tr>
                <td style={{ padding: "2px 6px" }}>employee@company.com</td>
                <td style={{ padding: "2px 6px" }}>Employee123!</td>
                <td style={{ padding: "2px 6px" }}>
                  Employee / HR (L2) ← Q2 demo
                </td>
              </tr>
              <tr>
                <td style={{ padding: "2px 6px" }}>
                  finance_employee@company.com
                </td>
                <td style={{ padding: "2px 6px" }}>Employee123!</td>
                <td style={{ padding: "2px 6px" }}>Employee / Finance (L2)</td>
              </tr>
              <tr>
                <td style={{ padding: "2px 6px" }}>
                  remote_employee@company.com
                </td>
                <td style={{ padding: "2px 6px" }}>Employee123!</td>
                <td style={{ padding: "2px 6px" }}>
                  Employee / IT (L3) 🏠 REMOTE ← Q1 demo
                </td>
              </tr>
              <tr>
                <td style={{ padding: "2px 6px" }}>auditor@company.com</td>
                <td style={{ padding: "2px 6px" }}>Auditor123!</td>
                <td style={{ padding: "2px 6px" }}>
                  Auditor / IT (L5) — Logs only
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
