import "dotenv/config";

const MONGO_URL = process.env.MONGO_URL || "";
const DB_TYPE = process.env.DB_TYPE || "MONGO";

const SQL_USER = process.env.SQL_USER || "";
const SQL_PORT = process.env.SQL_PORT || 5432;
const SQL_CACHE = process.env.SQL_CACHE || false;
const SQL_PASSWORD = process.env.SQL_PASSWORD || "";
const SQL_DATABASE = process.env.SQL_DATABASE || "";
const SQL_HOST = process.env.SQL_HOST || "localhost";
const SQL_LOGGING = process.env.SQL_LOGGING || false;

export {
  DB_TYPE,
  SQL_USER,
  SQL_PORT,
  SQL_HOST,
  SQL_CACHE,
  MONGO_URL,
  SQL_LOGGING,
  SQL_PASSWORD,
  SQL_DATABASE,
};
