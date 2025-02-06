import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";

import {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_CACHE,
  POSTGRES_DATABASE,
  POSTGRES_PASSWORD,
} from "src/config/database.configuration";
import { DatasourceInterface } from "../datasource.interface";
import { DB_TYPE_ENUM } from "../database.enum";

export class PostgresDataSource implements DatasourceInterface {
  private _datasource: DataSource;

  constructor(entities: Array<string>) {
    const options: DataSourceOptions = {
      useUTC: true,
      type: "postgres",
      synchronize: true,
      entities: entities,
      host: POSTGRES_HOST,
      port: +POSTGRES_PORT,
      username: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DATABASE,
      cache: POSTGRES_CACHE || POSTGRES_CACHE === "true" ? true : false,
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
      console.log(`[DATASOURCE][${DB_TYPE_ENUM.POSTGRESQL}] Connected`);

      return true;
    } catch (error: unknown) {
      throw new Error(
        `[ERROR][DATASOURCE][${DB_TYPE_ENUM.POSTGRESQL}][CONNECT] ${JSON.stringify(error)}`,
      );
    }
  }

  public disconnect(): void {
    this._datasource.destroy();
  }
}
