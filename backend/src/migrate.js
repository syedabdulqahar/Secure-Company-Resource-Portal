const fs = require("fs");
const path = require("path");
const db = require("./db");

(async () => {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, "..", "db_schema.sql"),
      "utf8",
    );
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      await db.query(stmt);
    }
    console.log("Migrations applied");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
})();
