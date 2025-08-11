import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";

import {
  SQL_HOST,
  SQL_PORT,
  SQL_USER,
  SQL_CACHE,
  SQL_DATABASE,
  SQL_PASSWORD,
} from "src/configuration/database.configuration";
import { DatasourceInterface } from "./datasource.interface";

export class PostgresDatasource implements DatasourceInterface {
  private _datasource: DataSource;

  constructor(entities: Array<Function>) {
    const options: DataSourceOptions = {
      useUTC: true,
      host: SQL_HOST,
      port: +SQL_PORT,
      type: "postgres",
      synchronize: true,
      username: SQL_USER,
      entities: entities,
      password: SQL_PASSWORD,
      database: SQL_DATABASE,
      cache: SQL_CACHE || SQL_CACHE === "true" ? true : false,
    };

    this._datasource = new DataSource(options);
  }

  public getClient(): DataSource {
    return this._datasource;
  }

  public connect(): Promise<void> {
    throw new Error("Method not allowed.");
  }

  public async status(): Promise<boolean> {
    try {
      await this._datasource.initialize();
      console.log(`[DATASOURCE][POSTGRES] Connected`);

      return true;
    } catch (error: unknown) {
      throw new Error(`[ERROR][DATASOURCE][POSTGRES][CONNECT] ${JSON.stringify(error)}`);
    }
  }

  public disconnect(): void {
    this._datasource.destroy();
  }
}
