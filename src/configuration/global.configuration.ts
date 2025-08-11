import "dotenv/config";

const PORT = process.env.PORT || "3000";
const API_PREFIX = process.env.API_PREFIX || "api";
const API_VERSION = process.env.API_VERSION || "v1";
const NODE_ENV = process.env.NODE_ENV || "development";
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || "*";

export { ALLOWED_ORIGINS, PORT, API_PREFIX, API_VERSION, NODE_ENV };
