import DataTable from "./ui/DataTable";

const CLASSIFICATION_LABELS = {
  1: "1 – Public",
  2: "2 – Internal",
  3: "3 – Restricted",
  4: "4 – Confidential",
  5: "5 – Top Secret",
};

const CLASSIFICATION_COLORS = {
  1: "#66bb6a",
  2: "#42a5f5",
  3: "#ffa726",
  4: "#ef5350",
  5: "#ab47bc",
};

export default function ResourcesTab({
  resources,
  isAdmin,
  canCreate,
  resourceForm,
  onResourceFormChange,
  onRefresh,
  onDelete,
  onCreate,
}) {
  return (
    <section className="section-stack">
      <section className="panel">
        <div className="panel-heading">
          <h2>Accessible Resources</h2>
          <button className="ghost-button compact" onClick={onRefresh}>
            Refresh
          </button>
        </div>
        {/* Viva note: yahan sirf woh resources dikhte hain jo RBAC+ABAC allow karte hain */}

        <p
          style={{ fontSize: "0.82rem", opacity: 0.7, marginBottom: "0.75rem" }}
        >{/**
          ✅ Yeh list sirf woh resources dikhati hai jo aapke RBAC role aur ABAC
          attributes (Department, Clearance Level, Location, Time) ke mutabiq{" "}
          <strong>allowed</strong> hain. Blocked resources nahi dikhenge.
        */}</p>
        <DataTable
          empty="⛔ Koi bhi resource accessible nahi hai — RBAC ya ABAC ne sab block kar diya."
        
          columns={["Name", "Department", "Classification (Level)", "Actions"]}
          rows={resources.map((resource) => [
            resource.resource_name,
            <span
              style={{
                padding: "2px 10px",
                borderRadius: 12,
                fontSize: "0.8rem",
                background:
                  resource.department === "IT"
                    ? "rgba(33,150,243,0.18)"
                    : resource.department === "HR"
                      ? "rgba(233,30,99,0.18)"
                      : "rgba(76,175,80,0.18)",
                color:
                  resource.department === "IT"
                    ? "#42a5f5"
                    : resource.department === "HR"
                      ? "#f48fb1"
                      : "#81c784",
                border: `1px solid ${
                  resource.department === "IT"
                    ? "rgba(33,150,243,0.4)"
                    : resource.department === "HR"
                      ? "rgba(233,30,99,0.4)"
                      : "rgba(76,175,80,0.4)"
                }`,
              }}
            >
              {resource.department}
            </span>,
            <span
              style={{
                fontWeight: 600,
                color: CLASSIFICATION_COLORS[resource.classification] || "#fff",
                fontSize: "0.85rem",
              }}
            >
              {CLASSIFICATION_LABELS[resource.classification] ||
                resource.classification}
            </span>,
            isAdmin ? (
              <button
                className="danger compact"
                onClick={() => onDelete(resource.resource_id)}
              >
                Delete
              </button>
            ) : (
              "-"
            ),
          ])}
        />
      </section>

      {canCreate && (
        <section className="panel">
          <h2>Create Resource</h2>
          <p
            style={{
              fontSize: "0.82rem",
              opacity: 0.7,
              marginBottom: "0.75rem",
            }}
          >
            Manager/Admin sirf woh resources create kar sakta hai jahan ABAC
            check pass ho (department match + clearance level kaafi ho).
          </p>
          <form className="form-grid" onSubmit={onCreate}>
            <input
              placeholder="Resource name"
              value={resourceForm.resource_name}
              onChange={(e) =>
                onResourceFormChange({
                  ...resourceForm,
                  resource_name: e.target.value,
                })
              }
              required
            />
            <select
              value={resourceForm.department}
              onChange={(e) =>
                onResourceFormChange({
                  ...resourceForm,
                  department: e.target.value,
                })
              }
            >
              <option>IT</option>
              <option>HR</option>
              <option>Finance</option>
            </select>
            <input
              type="number"
              min="1"
              max="5"
              placeholder="Classification (1=Public … 5=Top Secret)"
              value={resourceForm.classification}
              onChange={(e) =>
                onResourceFormChange({
                  ...resourceForm,
                  classification: Number(e.target.value),
                })
              }
              required
            />
            <button type="submit">Save Resource</button>
          </form>
        </section>
      )}
    </section>
  );
}
