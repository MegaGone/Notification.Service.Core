import express, { Application, Router } from "express";
import { ServerOptions } from "src/presentation/server";
import { SwaggerClient, SwaggerOptions } from "src/presentation/documentation";

export class Server {
  private readonly _port: string;
  private readonly _app: Application;
  private readonly _docs: SwaggerClient;

  constructor({ port }: ServerOptions) {
    this._port = port;
    this._app = express();
    this._docs = new SwaggerClient(SwaggerOptions);

    this._initRoutes();
  }

  private _initRoutes(): void {
    this._app.use("/api/docs", this._docs.serve(), this._docs.setup());
  }

  public async start(): Promise<void> {
    this._app.listen(this._port, () => {
      console.log(`http://localhost:${this._port}`);
    });
  }
}
