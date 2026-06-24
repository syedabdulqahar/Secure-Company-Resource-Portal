import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { API_BASE, emptyResource, emptyUser } from "./constants";
import LoginScreen from "./components/LoginScreen";
import AppHeader from "./components/AppHeader";
import TabNav from "./components/TabNav";
import MessageBanner from "./components/MessageBanner";
import DashboardTab from "./components/DashboardTab";
import ResourcesTab from "./components/ResourcesTab";
import UsersTab from "./components/UsersTab";
import RolesTab from "./components/RolesTab";
import AuditLogsTab from "./components/AuditLogsTab";
import AttacksTab from "./components/AttacksTab";

function App() {
  const [email, setEmail] = useState("admin@company.com");
  const [password, setPassword] = useState("Admin123!");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [resources, setResources] = useState([]);
  const [logs, setLogs] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [resourceForm, setResourceForm] = useState(emptyResource);
  const [userForm, setUserForm] = useState(emptyUser);
  const [editingUserId, setEditingUserId] = useState(null);
  const [logFilter, setLogFilter] = useState({ decision: "", search: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = useMemo(() => user?.role_name === "Admin", [user]);
  const canAudit = useMemo(
    () => ["Admin", "Auditor"].includes(user?.role_name),
    [user],
  );
  const maxDayCount = useMemo(
    () =>
      Math.max(
        1,
        ...(dashboard?.attemptsByDay || []).map((item) => Number(item.count)),
      ),
    [dashboard],
  );
  const maxDeniedCount = useMemo(
    () =>
      Math.max(
        1,
        ...(dashboard?.deniedByReason || []).map((item) => Number(item.count)),
      ),
    [dashboard],
  );

  useEffect(() => {
    if (!token || !user) return;
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  async function api(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw new Error(data?.error || "Request failed");
    }
    return data;
  }

  async function refreshAll() {
    setError("");
    try {
      const nextResources = await api("/resources");
      setResources(nextResources);

      const nextRoles = await api("/roles");
      setRoles(nextRoles);
      if (!userForm.role_id && nextRoles[0]) {
        setUserForm((current) => ({
          ...current,
          role_id: nextRoles[0].role_id,
        }));
      }

      if (canAudit) {
        const [nextLogs, nextDashboard] = await Promise.all([
          fetchLogs(),
          api("/dashboard"),
        ]);
        setLogs(nextLogs);
        setDashboard(nextDashboard);
      }

      if (isAdmin) {
        const [nextUsers, nextPolicies] = await Promise.all([
          api("/users"),
          api("/policies"),
        ]);
        setUsers(nextUsers);
        setPolicies(nextPolicies);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchLogs(filters = logFilter) {
    const params = new URLSearchParams();
    if (filters.decision) params.set("decision", filters.decision);
    if (filters.search) params.set("search", filters.search);
    return api(`/audit-logs${params.toString() ? `?${params}` : ""}`);
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      setUser(data.user);
      setActiveTab(
        ["Admin", "Auditor"].includes(data.user.role_name)
          ? "dashboard"
          : "resources",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setUser(null);
    setToken("");
    setResources([]);
    setLogs([]);
    setDashboard(null);
    setUsers([]);
    setPolicies([]);
    setSimulations([]);
    setNotice("");
    setError("");
  }

  async function createResource(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await api("/resources", {
        method: "POST",
        body: JSON.stringify(resourceForm),
      });
      setResourceForm(emptyResource);
      setNotice("Resource saved");
      await refreshAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteResource(resourceId) {
    setError("");
    setNotice("");
    try {
      await api(`/resources/${resourceId}`, { method: "DELETE" });
      setNotice("Resource deleted");
      await refreshAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveUser(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      if (editingUserId) {
        // Edit mode
        await api(`/users/${editingUserId}`, {
          method: "PUT",
          body: JSON.stringify(userForm),
        });
        setNotice("User updated");
        setEditingUserId(null);
      } else {
        // Create mode
        await api("/users", {
          method: "POST",
          body: JSON.stringify(userForm),
        });
        setNotice("User created");
      }
      setUserForm({ ...emptyUser, role_id: roles[0]?.role_id || "" });
      await refreshAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleStartEditUser(targetUser) {
    setEditingUserId(targetUser.user_id);
    setUserForm({
      name: targetUser.name || "",
      email: targetUser.email || "",
      password: "", // Password is not required when editing
      department: targetUser.department || "IT",
      clearance_level: targetUser.clearance_level || 1,
      location: targetUser.location || "Office",
      role_id: targetUser.role_id || "",
      status: targetUser.status || "Active",
    });
  }

  function handleCancelEditUser() {
    setEditingUserId(null);
    setUserForm({ ...emptyUser, role_id: roles[0]?.role_id || "" });
  }

  async function toggleUserSuspension(targetUser) {
    setError("");
    setNotice("");
    const newStatus =
      targetUser.status === "Suspended" ? "Active" : "Suspended";
    try {
      await api(`/users/${targetUser.user_id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setNotice(`User account ${newStatus.toLowerCase()}`);
      await refreshAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateUserRole(nextUser, roleId) {
    setError("");
    setNotice("");
    try {
      await api(`/users/${nextUser.user_id}`, {
        method: "PUT",
        body: JSON.stringify({ role_id: Number(roleId) }),
      });
      setNotice("Role updated");
      await refreshAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteUser(userId) {
    setError("");
    setNotice("");
    try {
      await api(`/users/${userId}`, { method: "DELETE" });
      setNotice("User deleted");
      await refreshAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function applyLogFilters(event) {
    event.preventDefault();
    try {
      setLogs(await fetchLogs(logFilter));
    } catch (err) {
      setError(err.message);
    }
  }

  async function runSimulations() {
    setError("");
    setNotice("");
    try {
      const data = await api("/attack-simulations");
      setSimulations(data);
      setNotice("Attack simulations completed");
      await refreshAll();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!user) {
    return (
      <LoginScreen
        email={email}
        password={password}
        loading={loading}
        error={error}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  const tabs = [
    canAudit && ["dashboard", "Dashboard"],
    ["resources", "Resources"],
    isAdmin && ["users", "Users"],
    isAdmin && ["roles", "Roles"],
    canAudit && ["logs", "Audit Logs"],
    canAudit && ["attacks", "Attack Tests"],
  ].filter(Boolean);

  return (
    <main className="app">
      <AppHeader user={user} onLogout={handleLogout} />
      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <MessageBanner error={error} notice={notice} />

      {activeTab === "dashboard" && canAudit && (
        <DashboardTab
          dashboard={dashboard}
          maxDayCount={maxDayCount}
          maxDeniedCount={maxDeniedCount}
        />
      )}

      {activeTab === "resources" && (
        <ResourcesTab
          resources={resources}
          isAdmin={isAdmin}
          canCreate={isAdmin || user.role_name === "Manager"}
          resourceForm={resourceForm}
          onResourceFormChange={setResourceForm}
          onRefresh={refreshAll}
          onDelete={deleteResource}
          onCreate={createResource}
        />
      )}

      {activeTab === "users" && isAdmin && (
        <UsersTab
          users={users}
          roles={roles}
          userForm={userForm}
          onUserFormChange={setUserForm}
          onCreate={saveUser}
          onUpdateRole={updateUserRole}
          onDelete={deleteUser}
          editingUserId={editingUserId}
          onStartEdit={handleStartEditUser}
          onCancelEdit={handleCancelEditUser}
          onToggleSuspension={toggleUserSuspension}
        />
      )}

      {activeTab === "roles" && isAdmin && (
        <RolesTab roles={roles} policies={policies} />
      )}

      {activeTab === "logs" && canAudit && (
        <AuditLogsTab
          logs={logs}
          logFilter={logFilter}
          onLogFilterChange={setLogFilter}
          onApplyFilters={applyLogFilters}
        />
      )}

      {activeTab === "attacks" && canAudit && (
        <AttacksTab
          simulations={simulations}
          onRunSimulations={runSimulations}
        />
      )}
    </main>
  );
}

export default App;
