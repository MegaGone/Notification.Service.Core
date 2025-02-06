import { DB_TYPE_ENUM } from "./database.enum";
import { DB_TYPE } from "src/config/database.configuration";
import { DatasourceInterface } from "./datasource.interface";
import { MongoDataSource } from "./datasource/mongodb.datasource";
import { PostgresDataSource } from "./datasource/postgres.datasource";

export class DatabaseManager {
  private _datasource!: DatasourceInterface;

  public async init(): Promise<DatasourceInterface> {
    await this._connect();
    await this._status();
    return this._datasource;
  }

  private async _connect(): Promise<void> {
    DB_TYPE === DB_TYPE_ENUM.MONGODB
      ? (this._datasource = new MongoDataSource())
      : (this._datasource = new PostgresDataSource([]));

    DB_TYPE === DB_TYPE_ENUM.MONGODB ? await this._datasource.connect() : null;
  }

  private async _status(): Promise<void> {
    const status = await this._datasource.status();
    if (!status) throw new Error(`[ERROR][CONNECTION] ${DB_TYPE}`);
  }
}
