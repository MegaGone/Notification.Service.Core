import "dotenv/config";

const DB_TYPE = process.env.DB_TYPE || "MONGO";

// NOSQL
const MONGO_URL = process.env.MONGO_URL || "";

// SQL
const POSTGRES_USER = process.env.SQL_USER || "";
const POSTGRES_PORT = process.env.SQL_PORT || 5432;
const POSTGRES_CACHE = process.env.SQL_CACHE || false;
const POSTGRES_PASSWORD = process.env.SQL_PASSWORD || "";
const POSTGRES_DATABASE = process.env.SQL_DATABASE || "";
const POSTGRES_LOGGING = process.env.SQL_LOGGING || false;
const POSTGRES_HOST = process.env.SQL_HOST || "localhost";

export {
    DB_TYPE,
    MONGO_URL,
    POSTGRES_USER,
    POSTGRES_PORT,
    POSTGRES_HOST,
    POSTGRES_CACHE,
    POSTGRES_LOGGING,
    POSTGRES_DATABASE,
    POSTGRES_PASSWORD,
};
