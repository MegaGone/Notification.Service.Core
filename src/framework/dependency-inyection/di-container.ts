import { LoggerClient } from "../logger/logger.client";
import { DatasourceInterface } from "../database/datasource/datasource.interface";
import { DatabaseManager } from "../database/database.manager";

export class DIContainer {
  private static _instance: DIContainer;

  private _logger!: LoggerClient;
  private _datasource!: DatasourceInterface;
  private _databaseManager!: DatabaseManager;

  private constructor() {
    this.initLogger();
    this.initDatabase();
  }

  public static getInstance(): DIContainer {
    if (!DIContainer._instance) DIContainer._instance = new DIContainer();

    return DIContainer._instance;
  }

  private initLogger(): void {
    this._logger = new LoggerClient();
  }

  private async initDatabase(): Promise<void> {
    this._databaseManager = new DatabaseManager();
    this._datasource = await this._databaseManager.init();
  }

  public get logger(): LoggerClient {
    return this._logger;
  }

  public get datasource(): DatasourceInterface {
    return this._datasource;
  }
}
