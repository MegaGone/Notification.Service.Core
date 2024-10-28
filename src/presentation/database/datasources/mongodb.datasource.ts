import { Connection, connect } from "mongoose";

import { MONGO_URL } from "src/config";
import { DB_TYPES, DatasourceInterface } from "src/presentation/database";

export class MongoDataSource implements DatasourceInterface {
    private _connection!: Connection;

    constructor() {}

    public async connect() {
        try {
            const { connection } = await connect(MONGO_URL);
            this._connection = connection;
            console.log(`[DATASOURCE][${DB_TYPES.MONGODB}] Connected`);
        } catch (error: unknown) {
            throw new Error(
                `[ERROR][DATASOURCE][${DB_TYPES.MONGODB}][CONNECT] ${JSON.stringify(error)}`,
            );
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
