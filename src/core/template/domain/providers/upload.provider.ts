export abstract class UploadProvider {
  public abstract upload(path: string): Promise<string>;
  public abstract findById(id: string): Promise<unknown>;
  public abstract deleteById(id: string): Promise<boolean>;
  public abstract getContentById(
    publicId: string,
  ): Promise<{ content: string; exception?: string }>;
}
