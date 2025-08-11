import morgan from "morgan";
import { IMiddleware } from "./implementation";
import { LoggerClient } from "src/framework/logger/logger.client";
import { Application, Request, Response, NextFunction } from "express";

export class LoggerMiddleware implements IMiddleware {
  private readonly _logger: LoggerClient;

  constructor(
    private readonly _app: Application,
    private readonly _client: LoggerClient,
  ) {
    this._logger = _client;
    _app.use(this.morgan());
    _app.use(this.intercept.bind(this));
  }

  public intercept(request: Request, response: Response, next: NextFunction) {
    next();
  }

  private morgan() {
    return morgan(
      (tokens, req: Request, res: Response) => {
        return JSON.stringify({
          method: tokens.method(req, res),
          url: tokens.url(req, res),
          status: Number.parseFloat(`${tokens.status(req, res)}`),
          content_length: tokens.res(req, res, "content-length"),
          response_time: Number.parseFloat(`${tokens["response-time"](req, res)}`),
          body: JSON.stringify(req.body),
        });
      },
      {
        stream: {
          write: (message) => {
            const data = JSON.parse(message);
            this._logger.http(`[HTTP][INCOMING REQUEST] [${data?.url || ""}]`, data);
          },
        },
      },
    );
  }
}
