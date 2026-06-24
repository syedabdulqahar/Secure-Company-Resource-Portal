const db = require("./db");

function normalizePermission(permissionName) {
  return String(permissionName || "")
    .trim()
    .toUpperCase();
}

async function getRolePermissions(roleId) {
  const result = await db.query(
    `
      SELECT p.permission_name
      FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.permission_id
      WHERE rp.role_id = $1
    `,
    [roleId],
  );

  return result.rows.map((row) => normalizePermission(row.permission_name));
}

async function userHasPermission(user, permissionName) {
  if (!user || !user.role_id) {
    return false;
  }

  const permissions = await getRolePermissions(user.role_id);
  return permissions.includes(normalizePermission(permissionName));
}

function isAdmin(user) {
  return user?.role_name === "Admin";
}

function isAuditor(user) {
  return user?.role_name === "Auditor";
}

function formatTime(date) {
  return date.toISOString().slice(11, 16);
}

function getAttributeValue(attribute, user, resource, env) {
  const key = String(attribute || "")
    .trim()
    .toLowerCase();

  if (key === "time") {
    return env.currentTime || formatTime(new Date());
  }

  if (key === "department") {
    return user.department;
  }

  if (key === "clearance_level") {
    return Number(user.clearance_level);
  }

  if (key === "location") {
    return user.location;
  }

  if (key === "resource_department") {
    return resource?.department;
  }

  if (key === "resource_classification") {
    return Number(resource?.classification);
  }

  return undefined;
}

function evaluateCondition(policy, user, resource, env) {
  const left = getAttributeValue(policy.attribute, user, resource, env);
  if (left === undefined || left === null) {
    return false;
  }

  const operator = String(policy.operator || "")
    .trim()
    .toUpperCase();
  const rawValue = String(policy.value || "").trim();
  const right = getAttributeValue(rawValue, user, resource, env) ?? rawValue;

  if (operator === "=") {
    return String(left) === String(right);
  }

  if (operator === "!=") {
    return String(left) !== String(right);
  }

  if (operator === ">=") {
    return Number(left) >= Number(right);
  }

  if (operator === "<=") {
    return Number(left) <= Number(right);
  }

  if (operator === ">") {
    return Number(left) > Number(right);
  }

  if (operator === "<") {
    return Number(left) < Number(right);
  }

  if (operator === "BETWEEN") {
    const [start, end] = rawValue.split("-").map((part) => part.trim());
    if (!start || !end || typeof left !== "string") {
      return false;
    }
    return left >= start && left <= end;
  }

  return false;
}

async function evaluateABAC(user, resource, env = {}) {
  if (isAdmin(user)) {
    return true;
  }

  const result = await db.query("SELECT * FROM policies ORDER BY policy_id");
  const policies = result.rows || [];

  const denyPolicyMatched = policies
    .filter(
      (policy) =>
        String(policy.action || "")
          .trim()
          .toUpperCase() === "DENY",
    )
    .some((policy) => evaluateCondition(policy, user, resource, env));

  if (denyPolicyMatched) {
    return false;
  }

  const allowPolicies = policies.filter(
    (policy) =>
      String(policy.action || "")
        .trim()
        .toUpperCase() === "ALLOW",
  );

  return allowPolicies.every((policy) =>
    evaluateCondition(policy, user, resource, env),
  );
}

async function recordAudit({
  userId,
  resourceId = null,
  action,
  decision,
  ipAddress,
  reason = null,
}) {
  await db.query(
    `
      INSERT INTO audit_logs(user_id, resource_id, action, decision, ip_address, reason)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [userId, resourceId, action, decision, ipAddress, reason],
  );
}

async function canAccessResource(user, resource, action, env = {}) {
  if (!resource) {
    return false;
  }

  if (isAuditor(user)) {
    return false;
  }

  const permissionName = String(action || "")
    .trim()
    .toUpperCase();
  if (!(await userHasPermission(user, permissionName))) {
    return false;
  }

  return evaluateABAC(user, resource, env);
}

async function canAccessLogs(user) {
  return isAdmin(user) || isAuditor(user);
}

module.exports = {
  getRolePermissions,
  userHasPermission,
  isAdmin,
  isAuditor,
  canAccessResource,
  canAccessLogs,
  evaluateABAC,
  recordAudit,
};
