import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { DB_TYPES, DatasourceInterface } from "src/presentation/database";

import {
    POSTGRES_CACHE,
    POSTGRES_DATABASE,
    POSTGRES_HOST,
    POSTGRES_PASSWORD,
    POSTGRES_PORT,
    POSTGRES_USER,
} from "src/config";

export class PostgresDataSource implements DatasourceInterface {
    private _datasource: DataSource;

    // TODO: SET CORRECT TYPE TO ENTITIES
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
        throw new Error("Method not implemented.");
    }

    public async status(): Promise<boolean> {
        try {
            await this._datasource.initialize();
            console.log(`[DATASOURCE][${DB_TYPES.POSTGRESQL}] Connected`);

            return true;
        } catch (error: unknown) {
            throw new Error(
                `[ERROR][DATASOURCE][${DB_TYPES.POSTGRESQL}][CONNECT] ${JSON.stringify(error)}`,
            );
        }
    }

    public disconnect(): void {
        this._datasource.destroy();
    }
}
