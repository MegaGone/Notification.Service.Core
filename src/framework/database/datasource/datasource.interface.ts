export abstract class DatasourceInterface {
  public abstract disconnect(): void;
  public abstract getClient(): unknown;
  public abstract connect(): Promise<void>;
  public abstract status(): boolean | Promise<boolean>;
}
