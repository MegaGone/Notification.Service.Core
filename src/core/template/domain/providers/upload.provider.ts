import { UploadResult, ContentResult } from "./upload-response.interface";

export abstract class UploadProvider {
  public abstract findById(id: string): Promise<unknown>;
  public abstract deleteById(id: string): Promise<boolean>;
  public abstract upload(path: string): Promise<UploadResult>;
  public abstract getContentById(publicId: string): Promise<ContentResult>;
}
