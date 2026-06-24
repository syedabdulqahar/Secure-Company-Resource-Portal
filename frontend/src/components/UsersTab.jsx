import DataTable from "./ui/DataTable";

export default function UsersTab({
  users,
  roles,
  userForm,
  onUserFormChange,
  onCreate,
  onUpdateRole,
  onDelete,
  editingUserId,
  onStartEdit,
  onCancelEdit,
  onToggleSuspension,
}) {
  return (
    <section className="section-stack">
      <section className="panel">
        <h2>{editingUserId ? "Edit User" : "Create User"}</h2>
        <form className="form-grid" onSubmit={onCreate}>
          <input
            placeholder="Name"
            value={userForm.name}
            onChange={(e) =>
              onUserFormChange({ ...userForm, name: e.target.value })
            }
            required
          />
          <input
            placeholder="Email"
            type="email"
            value={userForm.email}
            onChange={(e) =>
              onUserFormChange({ ...userForm, email: e.target.value })
            }
            required
          />
          <input
            placeholder={editingUserId ? "Password (leave blank to keep current)" : "Password"}
            type="password"
            value={userForm.password}
            onChange={(e) =>
              onUserFormChange({ ...userForm, password: e.target.value })
            }
            required={!editingUserId}
          />
          <select
            value={userForm.department}
            onChange={(e) =>
              onUserFormChange({ ...userForm, department: e.target.value })
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
            value={userForm.clearance_level}
            onChange={(e) =>
              onUserFormChange({
                ...userForm,
                clearance_level: Number(e.target.value),
              })
            }
          />
          <select
            value={userForm.location}
            onChange={(e) =>
              onUserFormChange({ ...userForm, location: e.target.value })
            }
          >
            <option>Office</option>
            <option>Remote</option>
          </select>
          <select
            value={userForm.role_id}
            onChange={(e) =>
              onUserFormChange({ ...userForm, role_id: e.target.value })
            }
          >
            {roles.map((role) => (
              <option key={role.role_id} value={role.role_id}>
                {role.role_name}
              </option>
            ))}
          </select>
          <select
            value={userForm.status || "Active"}
            onChange={(e) =>
              onUserFormChange({ ...userForm, status: e.target.value })
            }
          >
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
          <div className="button-group" style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit">
              {editingUserId ? "Update User" : "Create User"}
            </button>
            {editingUserId && (
              <button type="button" className="ghost-button" onClick={onCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>User Management</h2>
        <DataTable
          empty="No users found."
          columns={[
            "Name",
            "Email",
            "Department",
            "Clearance",
            "Location",
            "Role",
            "Status",
            "Actions",
          ]}
          rows={users.map((item) => [
            item.name,
            item.email,
            item.department,
            item.clearance_level,
            item.location,
            <select
              value={item.role_id}
              onChange={(e) => onUpdateRole(item, e.target.value)}
            >
              {roles.map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </option>
              ))}
            </select>,
            <span className={`status-badge ${item.status === "Suspended" ? "suspended" : "active"}`}>
              {item.status || "Active"}
            </span>,
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <button
                className="ghost-button compact"
                onClick={() => onStartEdit(item)}
              >
                Edit
              </button>
              <button
                className={`compact ${item.status === "Suspended" ? "success" : "warning"}`}
                onClick={() => onToggleSuspension(item)}
              >
                {item.status === "Suspended" ? "Activate" : "Suspend"}
              </button>
              <button
                className="danger compact"
                onClick={() => onDelete(item.user_id)}
              >
                Delete
              </button>
            </div>,
          ])}
        />
      </section>
    </section>
  );
}
