import DataTable from "./ui/DataTable";

const ROLE_DESCRIPTIONS = {
  Admin: "Sab kuch kar sakta hai. ABAC bypass hota hai. User add/remove/suspend kar sakta hai.",
  Manager: "Apne department ke resources READ, WRITE, UPDATE kar sakta hai. DELETE nahi kar sakta.",
  Employee: "Sirf READ access hai. Kuch create ya edit nahi kar sakta.",
  Auditor: "Resources ka data nahi dekh sakta. Sirf Audit Logs aur Dashboard dekh sakta hai.",
};

const POLICY_DESCRIPTIONS = {
  "department=resource_department": "User aur Resource ka department same hona chahiye (ABAC dept. check).",
  "clearance_level>=resource_classification": "User ka clearance level resource ke classification se >= hona chahiye.",
  "location=Office": "Office se access karne wale ko ALLOW karo.",
  "location!=Remote": "Remote se aane wale ko seedha DENY — baaki rules dekhe bina.",
  "time BETWEEN 08:00-18:00": "Sirf office timings (8am – 6pm) mein access allow hoga.",
};

export default function RolesTab({ roles, policies }) {
  return (
    <section className="section-stack">
      {/* RBAC Table */}
      <section className="panel">
        <h2>Role Permission Matrix (RBAC)</h2>
        <p style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.75rem" }}>
          Har role ke paas fixed permissions hoti hain — yeh RBAC (Role-Based Access Control) hai.
        </p>
        <DataTable
          empty="No roles found."
          columns={["Role", "Permissions", "Description (Roman Urdu)"]}
          rows={roles.map((role) => [
            <span style={{ fontWeight: 700 }}>{role.role_name}</span>,
            <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#4fc3f7" }}>
              {role.permissions.join(", ") || "—"}
            </span>,
            <span style={{ fontSize: "0.82rem", opacity: 0.85 }}>
              {ROLE_DESCRIPTIONS[role.role_name] || "—"}
            </span>,
          ])}
        />
        <div
          style={{
            marginTop: "0.75rem",
            padding: "0.6rem 1rem",
            background: "rgba(255,193,7,0.12)",
            border: "1px solid rgba(255,193,7,0.35)",
            borderRadius: "8px",
            fontSize: "0.82rem",
          }}
        >
          ⚠️ <strong>Admin ka ABAC bypass:</strong> Admin role ke liye ABAC policies evaluate nahi
          hoti — woh directly{" "}
          <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: 4 }}>
            return true
          </code>{" "}
          ho jata hai. Isliye Admin kisi bhi department ya classification ki file access kar sakta hai.
        </div>
        <div
          style={{
            marginTop: "0.5rem",
            padding: "0.6rem 1rem",
            background: "rgba(33,150,243,0.1)",
            border: "1px solid rgba(33,150,243,0.3)",
            borderRadius: "8px",
            fontSize: "0.82rem",
          }}
        >
          ℹ️ <strong>Auditor ki restriction:</strong> Auditor ke paas READ permission hai lekin{" "}
          <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: 4 }}>
            canAccessResource()
          </code>{" "}
          function Auditor ko hamesha <strong>false</strong> return karta hai. Woh sirf Audit Logs
          aur Dashboard dekh sakta hai.
        </div>
      </section>

      {/* ABAC Table */}
      <section className="panel">
        <h2>ABAC Policies (Attribute-Based Access Control)</h2>
        <p style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.75rem" }}>
          RBAC allow karne ke baad yeh 5 rules sequentially check hote hain (Admin ke ilawa sab par).
          DENY rule pehle evaluate hota hai — ek bhi DENY match ho to access block ho jata hai.
        </p>
        <DataTable
          empty="No policies found."
          columns={["#", "Attribute", "Operator", "Value", "Action", "Explanation"]}
          rows={policies.map((policy, idx) => {
            const descKey = `${policy.attribute}${policy.operator}${policy.value}`;
            const description = POLICY_DESCRIPTIONS[descKey] || "—";
            return [
              <span style={{ opacity: 0.5 }}>{idx + 1}</span>,
              <code style={{ fontSize: "0.85rem", color: "#80cbc4" }}>{policy.attribute}</code>,
              <code style={{ fontSize: "0.85rem", color: "#ffb74d" }}>{policy.operator}</code>,
              <code style={{ fontSize: "0.85rem", color: "#ce93d8" }}>{policy.value}</code>,
              <span
                style={{
                  fontWeight: 700,
                  color: policy.action?.toUpperCase() === "DENY" ? "#ef5350" : "#66bb6a",
                }}
              >
                {policy.action}
              </span>,
              <span style={{ fontSize: "0.8rem", opacity: 0.85 }}>{description}</span>,
            ];
          })}
        />
      </section>
    </section>
  );
}
