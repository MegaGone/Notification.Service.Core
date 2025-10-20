import { Connection, connect } from "mongoose";
import { DatasourceInterface } from "./datasource.interface";
import { MONGO_URL } from "src/configuration/database.configuration";

export class MongoDatasource implements DatasourceInterface {
  private _connection!: Connection;

  public async connect(): Promise<void> {
    try {
      const { connection } = await connect(MONGO_URL);
      this._connection = connection;

      console.log(`[DATASOURCE][MONGO] Connected`);
    } catch (error: unknown) {
      throw new Error(`[ERROR][DATASOURCE][MONGO][CONNECT] ${JSON.stringify(error)}`);
    }
  }

  public getClient(): Connection {
    return this._connection;
  }

  public status(): boolean {
    return this._connection.readyState !== 1 ? false : true;
  }

  public async disconnect(): Promise<void> {
    return this._connection.close();
  }
}
