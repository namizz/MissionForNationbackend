const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

function normalizedConnectionString(input) {
  if (!input) return input;
  try {
    const parsed = new URL(input);
    const sslmode = (parsed.searchParams.get("sslmode") || "").toLowerCase();
    if (
      sslmode === "prefer" ||
      sslmode === "require" ||
      sslmode === "verify-ca"
    ) {
      parsed.searchParams.set("sslmode", "verify-full");
      return parsed.toString();
    }
    // If no sslmode, add require for Render compatibility
    if (!sslmode) {
      parsed.searchParams.set("sslmode", "require");
      return parsed.toString();
    }
    return input;
  } catch (_) {
    return input;
  }
}

const connectionString = normalizedConnectionString(process.env.DATABASE_URL);

const pool = new Pool({
  connectionString,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
