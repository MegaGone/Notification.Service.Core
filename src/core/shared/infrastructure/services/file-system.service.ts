import { unlink } from "fs";
import { resolve } from "path";
import { promisify } from "util";

const unlinkAsync = promisify(unlink);

export class FileSystemService {
  public resolvePath(path: string): string {
    return resolve(path);
  }

  public async deleteFile(filePath: string): Promise<void> {
    try {
      await unlinkAsync(filePath);
    } catch (error) {
      console.log(`[ERROR][FILE_SYSTEM][DELETE] Failed to delete file: ${error}`);
    }
  }
}
