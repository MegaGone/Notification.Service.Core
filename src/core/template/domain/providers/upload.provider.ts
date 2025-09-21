export abstract class UploadProvider {
  public abstract upload(path: string): Promise<string>;
  public abstract findById(id: string): Promise<unknown>;
  public abstract deleteById(id: string): Promise<boolean>;
}
