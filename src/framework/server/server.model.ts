import {
  CorsMiddleware,
  LoggerMiddleware,
  BodyParseMiddleware,
  ExceptionMiddleware,
} from "./middlewares";
import { IServerOptions } from "./server.options";
import { DIContainer } from "../dependency-inyection";
import express, { Application, Router } from "express";
import { SwaggerClient } from "../documentation/swagger.client";
import { SwaggerOptions } from "../documentation/swagger.options";

export class MServer {
  private readonly _port: number;
  private readonly _router: Router;
  private readonly _app: Application;
  private readonly _apiVersion: string;
  private readonly _docs: SwaggerClient;
  private readonly _container: DIContainer;

  constructor(options: IServerOptions) {
    this._app = express();
    this._port = options.port;
    this._router = options.routes;
    this._apiVersion = options.apiVersion;
    this._container = DIContainer.getInstance();
    this._docs = new SwaggerClient(SwaggerOptions);

    this.init();
  }

  private async init(): Promise<void> {
    this.initMiddlewares();
    this.initDocumentation();
    this.initRoutes();
  }

  private initMiddlewares(): void {
    new CorsMiddleware(this._app);
    new BodyParseMiddleware(this._app);
    new LoggerMiddleware(this._app, this._container.logger);
  }

  private initRoutes(): void {
    this._app.use(this._router);
    new ExceptionMiddleware(this._app).register();
  }

  private initDocumentation(): void {
    this._app.use("/api/docs", this._docs.serve(), this._docs.setup());
  }

  public async start(): Promise<void> {
    this._app.listen(this._port, () => {
      console.info(`http://localhost:${this._port}/api/docs`);
    });
  }
}
