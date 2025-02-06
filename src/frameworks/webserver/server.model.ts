import { ServerOptions } from "./server.options";
import express, { Application, Request, Response, NextFunction } from "express";

import { LoggerClient } from "../logger/logger.client";
import { SwaggerClient } from "../documentation/swagger.client";
import { SwaggerOptions } from "../documentation/swagger.options";

import { DatabaseManager } from "../database/databse.manager";
import { DatasourceInterface } from "../database/datasource.interface";

import { CorsMiddlewareApiAdapter } from "./middlewares/cors.middleware";
import { LoggerMiddlewareApiAdapter } from "./middlewares/logger.middleware";
import { ExceptionMiddlewareApiAdapter } from "./middlewares/exception.middleware";
import { BodyParseMiddlewareApiAdapter } from "./middlewares/body-parser.middleware";
import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";

export class Server {
  private readonly _port: number;
  private readonly _app: Application;
  private readonly _docs: SwaggerClient;
  private _datasource!: DatasourceInterface;
  private _databaseManager: DatabaseManager;

  constructor(options: ServerOptions) {
    this._app = express();
    this._port = options.port;
    this._databaseManager = new DatabaseManager();
    this._docs = new SwaggerClient(SwaggerOptions);

    this._database();
    this._middlewares();
    this._documentation();
    this._routes();
  }

  private _middlewares(): void {
    new CorsMiddlewareApiAdapter(this._app);
    new BodyParseMiddlewareApiAdapter(this._app);
    new LoggerMiddlewareApiAdapter(this._app, new LoggerClient());
  }

  private _routes(): void {
    this._handlers();
  }

  private _documentation(): void {
    this._app.use("/api/docs", this._docs.serve(), this._docs.setup());
  }

  private async _database(): Promise<void> {
    try {
      this._datasource = await this._databaseManager.init();
      this._app.locals.datasource = this._datasource;
    } catch (error: unknown) {
      console.error(`${(error as Error).message}`);
    }
  }

  private _handlers(): void {
    this._app.use((error: ResponseStatus, req: Request, res: Response, next: NextFunction) => {
      ExceptionMiddlewareApiAdapter.intercept(req, res, next, error);
    });
  }

  public start(): void {
    this._app.listen(this._port, () => {
      console.info(`http://localhost:${this._port}/api/docs`);
    });
  }
}
