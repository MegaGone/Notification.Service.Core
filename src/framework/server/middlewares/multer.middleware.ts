import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import {
  MULTER_PARAM,
  MULTER_DIRECTORY,
  MULTER_ALLOWED_FILES,
} from "src/configuration/multer.configuration";
import multer, { diskStorage, StorageEngine } from "multer";

interface IFile {
  encoding?: string;
  mimetype?: string;
  fieldname?: string;
  originalname?: string;
}

const storage: StorageEngine = diskStorage({
  destination: (_req, _file: IFile, cb) => {
    const uploadPath = join(process.cwd(), MULTER_DIRECTORY);

    if (!existsSync(uploadPath)) {
      try {
        mkdirSync(uploadPath, { recursive: true });
      } catch (error) {
        return cb(error as Error, "");
      }
    }

    cb(null, MULTER_DIRECTORY);
  },
  filename: (_req, file: IFile, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const single = multer({
  storage: storage,
  fileFilter: (_req, file: IFile, cb) => {
    if (!MULTER_ALLOWED_FILES.split(",").includes(file.mimetype ?? "")) return cb(null, false);

    cb(null, true);
  },
}).single(MULTER_PARAM);

export { single };
