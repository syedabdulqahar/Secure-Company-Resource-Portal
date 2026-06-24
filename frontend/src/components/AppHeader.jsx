const ROLE_COLORS = {
  Admin: { bg: "rgba(156,39,176,0.25)", border: "rgba(156,39,176,0.6)", text: "#ce93d8" },
  Manager: { bg: "rgba(33,150,243,0.2)", border: "rgba(33,150,243,0.5)", text: "#42a5f5" },
  Employee: { bg: "rgba(76,175,80,0.2)", border: "rgba(76,175,80,0.5)", text: "#81c784" },
  Auditor: { bg: "rgba(255,152,0,0.2)", border: "rgba(255,152,0,0.5)", text: "#ffa726" },
};

export default function AppHeader({ user, onLogout }) {
  const roleColor = ROLE_COLORS[user.role_name] || { bg: "rgba(255,255,255,0.1)", border: "rgba(255,255,255,0.3)", text: "#fff" };
  const isRemote = user.location === "Remote";

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">CS3723 Database Security | RBAC + ABAC Portal</p>
        <h1 style={{ marginBottom: "0.3rem" }}>{user.name}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          {/* Role badge */}
          <span
            style={{
              padding: "2px 12px",
              borderRadius: 20,
              fontSize: "0.78rem",
              fontWeight: 700,
              background: roleColor.bg,
              border: `1px solid ${roleColor.border}`,
              color: roleColor.text,
            }}
          >
            {user.role_name}
          </span>
          {/* Department */}
          <span style={{ fontSize: "0.82rem", opacity: 0.8 }}>
            🏢 {user.department}
          </span>
          {/* Clearance level */}
          <span style={{ fontSize: "0.82rem", opacity: 0.8 }}>
            🔐 Clearance L{user.clearance_level}
          </span>
          {/* Location with warning if Remote */}
          <span
            style={{
              fontSize: "0.82rem",
              color: isRemote ? "#ef5350" : "#81c784",
              fontWeight: isRemote ? 700 : 400,
            }}
          >
            {isRemote ? "🏠 REMOTE (ABAC will DENY)" : "🏢 Office"}
          </span>
        </div>
      </div>
      <button className="ghost-button" onClick={onLogout}>
        Log out
      </button>
    </header>
  );
}
