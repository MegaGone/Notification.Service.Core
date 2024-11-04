import {
    CorsMiddlewareApiAdapter,
    LoggerMiddlewareApiAdapter,
    BodyParseMiddlewareApiAdapter,
    ExceptionMiddlewareApiAdapter,
} from "src/presentation/driver/adapter";
import express, { Application } from "express";
import { LoggerClient } from "src/presentation/logger";
import { SwaggerConfig, SwaggerOptions } from "src/presentation/documentation";
import { DatasourceInterface, DatabaseManager } from "src/presentation/database";
import { CompanyControlPlane } from "src/core";

export class Server {
    private readonly _port: number;
    private readonly _app: Application;
    private readonly _docs: SwaggerConfig;
    private _datasource!: DatasourceInterface;
    private _databaseManager: DatabaseManager;

    constructor(private readonly port: number) {
        this._port = port;
        this._app = express();
        this._databaseManager = new DatabaseManager();
        this._docs = new SwaggerConfig(SwaggerOptions);

        this._middlewares();
        this._documentation();
        this._routes();
        this._database();
    }

    private _middlewares(): void {
        new CorsMiddlewareApiAdapter(this._app);
        new BodyParseMiddlewareApiAdapter(this._app);
        new LoggerMiddlewareApiAdapter(this._app, new LoggerClient());
    }

    private _routes(): void {
        new CompanyControlPlane(this._app);
        new ExceptionMiddlewareApiAdapter(this._app);
    }

    private _documentation(): void {
        this._app.use("/api/docs", this._docs.serve(), this._docs.setup());
    }

    private async _database(): Promise<void> {
        try {
            this._datasource = await this._databaseManager.init();
            this._app.locals.datasource = this._datasource;
        } catch (error) {
            console.error(`${(error as Error).message}`);
        }
    }

    public start(): void {
        this._app.listen(this._port, () => {
            console.log(`http://localhost:${this._port}`);
        });
    }
}
