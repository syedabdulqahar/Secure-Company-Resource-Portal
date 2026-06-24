const db = require("./db");
const { hashPassword } = require("./auth");

async function seed() {
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    const roles = ["Admin", "Manager", "Employee", "Auditor"];
    for (const roleName of roles) {
      await client.query(
        "INSERT INTO roles (role_name) VALUES ($1) ON CONFLICT (role_name) DO NOTHING",
        [roleName],
      );
    }

    const permissions = ["READ", "WRITE", "UPDATE", "DELETE"];
    for (const permissionName of permissions) {
      await client.query(
        "INSERT INTO permissions (permission_name) VALUES ($1) ON CONFLICT (permission_name) DO NOTHING",
        [permissionName],
      );
    }

    const rolePermissions = {
      Admin: ["READ", "WRITE", "UPDATE", "DELETE"],
      Manager: ["READ", "WRITE", "UPDATE"],
      Employee: ["READ"],
      Auditor: ["READ"],
    };

    const roleRes = await client.query("SELECT role_id, role_name FROM roles");
    const permissionRes = await client.query("SELECT permission_id, permission_name FROM permissions");
    const roleIds = Object.fromEntries(roleRes.rows.map((row) => [row.role_name, row.role_id]));
    const permissionIds = Object.fromEntries(
      permissionRes.rows.map((row) => [row.permission_name, row.permission_id]),
    );

    for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
      const roleId = roleIds[roleName];
      for (const permissionName of permissionNames) {
        const permissionId = permissionIds[permissionName];
        await client.query(
          `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)
          ON CONFLICT (role_id, permission_id) DO NOTHING`,
          [roleId, permissionId],
        );
      }
    }

    const policies = [
      {
        attribute: "department",
        operator: "=",
        value: "resource_department",
        action: "ALLOW",
      },
      {
        attribute: "clearance_level",
        operator: ">=",
        value: "resource_classification",
        action: "ALLOW",
      },
      {
        attribute: "location",
        operator: "=",
        value: "Office",
        action: "ALLOW",
      },
      {
        attribute: "location",
        operator: "=",
        value: "Remote",
        action: "DENY",
      },
      {
        attribute: "time",
        operator: "BETWEEN",
        value: "08:00-18:00",
        action: "ALLOW",
      },
    ];

    for (const policy of policies) {
      const existingPolicy = await client.query(
        `SELECT 1 FROM policies WHERE attribute = $1 AND operator = $2 AND value = $3 AND action = $4`,
        [policy.attribute, policy.operator, policy.value, policy.action],
      );

      if (!existingPolicy.rows.length) {
        await client.query(
          `INSERT INTO policies (attribute, operator, value, action)
           VALUES ($1, $2, $3, $4)`,
          [policy.attribute, policy.operator, policy.value, policy.action],
        );
      }
    }

    const resources = [
      { resource_name: "IT Server Configuration", department: "IT", classification: 3 },
      { resource_name: "HR Policy Document", department: "HR", classification: 2 },
      { resource_name: "Finance Forecast", department: "Finance", classification: 4 },
      { resource_name: "Employee Handbook", department: "HR", classification: 1 },
      { resource_name: "Finance Ledger Q2", department: "Finance", classification: 3 },
      { resource_name: "Finance Payroll Data", department: "Finance", classification: 5 },
      { resource_name: "HR Performance Reviews", department: "HR", classification: 4 },
      { resource_name: "IT Network Topology", department: "IT", classification: 4 },
      { resource_name: "Company Strategy Draft", department: "IT", classification: 5 },
      { resource_name: "Public Press Release", department: "HR", classification: 1 },
    ];

    for (const resource of resources) {
      const existingResource = await client.query(
        `SELECT 1 FROM resources WHERE resource_name = $1`,
        [resource.resource_name],
      );

      if (!existingResource.rows.length) {
        await client.query(
          `INSERT INTO resources (resource_name, department, classification)
           VALUES ($1, $2, $3)`,
          [resource.resource_name, resource.department, resource.classification],
        );
      }
    }

    const users = [
      {
        name: "System Administrator",
        email: "admin@company.com",
        password: "Admin123!",
        department: "IT",
        clearance_level: 5,
        location: "Office",
        role: "Admin",
      },
      {
        name: "IT Manager",
        email: "manager@company.com",
        password: "Manager123!",
        department: "IT",
        clearance_level: 4,
        location: "Office",
        role: "Manager",
      },
      {
        name: "HR Employee",
        email: "employee@company.com",
        password: "Employee123!",
        department: "HR",
        clearance_level: 2,
        location: "Office",
        role: "Employee",
      },
      {
        name: "Audit Specialist",
        email: "auditor@company.com",
        password: "Auditor123!",
        department: "IT",
        clearance_level: 5,
        location: "Office",
        role: "Auditor",
      },
      {
        name: "Finance Manager",
        email: "finance_manager@company.com",
        password: "Manager123!",
        department: "Finance",
        clearance_level: 4,
        location: "Office",
        role: "Manager",
      },
      {
        name: "Finance Employee",
        email: "finance_employee@company.com",
        password: "Employee123!",
        department: "Finance",
        clearance_level: 2,
        location: "Office",
        role: "Employee",
      },
      {
        name: "Remote Employee",
        email: "remote_employee@company.com",
        password: "Employee123!",
        department: "IT",
        clearance_level: 3,
        location: "Remote",
        role: "Employee",
      },
      {
        name: "HR Manager",
        email: "hr_manager@company.com",
        password: "Manager123!",
        department: "HR",
        clearance_level: 4,
        location: "Office",
        role: "Manager",
      },
    ];

    for (const user of users) {
      const passwordHash = await hashPassword(user.password);
      await client.query(
        `INSERT INTO users (name, email, password_hash, department, clearance_level, location, role_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO NOTHING`,
        [user.name, user.email, passwordHash, user.department, user.clearance_level, user.location, roleIds[user.role]],
      );
    }

    await client.query("COMMIT");
    console.log("Seed data applied successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to seed database:", error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
