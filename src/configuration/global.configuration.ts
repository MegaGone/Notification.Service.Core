import "dotenv/config";

const PORT = process.env.PORT || "3000";
const NODE_ENV = process.env.NODE_ENV || "development";
const API_VERSION = process.env.API_VERSION || "/api/v1";
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || "*";

export { ALLOWED_ORIGINS, PORT, API_VERSION, NODE_ENV };
