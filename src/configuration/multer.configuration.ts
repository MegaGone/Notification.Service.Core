import "dotenv/config";

const MULTER_PARAM = process.env.MULTER_PARAM || "template";
const MULTER_DIRECTORY = process.env.MULTER_DIRECTORY || "templates";
const MULTER_MAXIMUN_ALLOWED_FILES = process.env.MULTER_MAXIMUN_ALLOWED_FILES || "1";
const MULTER_ALLOWED_FILES = process.env.MULTER_ALLOWED_FILES || "text/plain,text/html";

export { MULTER_PARAM, MULTER_DIRECTORY, MULTER_ALLOWED_FILES, MULTER_MAXIMUN_ALLOWED_FILES };
