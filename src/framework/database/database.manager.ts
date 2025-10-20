import { DB_TYPE_ENUM } from "./database.enum";
import { MongoDatasource } from "./datasource/mongo.datasource";
import { DB_TYPE } from "src/configuration/database.configuration";
import { PostgresDatasource } from "./datasource/postgres.datasource";
import { DatasourceInterface } from "./datasource/datasource.interface";

export class DatabaseManager {
  private _datasource!: DatasourceInterface;

  public async init(): Promise<DatasourceInterface> {
    await this._connect();
    await this._status();
    return this._datasource;
  }

  private async _connect(): Promise<void> {
    DB_TYPE === DB_TYPE_ENUM.MONGODB
      ? (this._datasource = new MongoDatasource())
      : (this._datasource = new PostgresDatasource([]));

    DB_TYPE === DB_TYPE_ENUM.MONGODB ? await this._datasource.connect() : null;
  }

  private async _status(): Promise<void> {
    const status = await this._datasource.status();
    if (!status) throw new Error(`[ERROR][CONNECTION] ${DB_TYPE}`);
  }
}
