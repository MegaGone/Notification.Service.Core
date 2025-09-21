import cors from "cors";
import { IMiddleware } from "./implementation";
import { Application, Request, Response, NextFunction } from "express";
import { ALLOWED_ORIGINS } from "src/configuration/global.configuration";
import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";
import { HTTP_STATUS_CODE_ENUM } from "src/core/shared/domain/entities/status-code.enum";

export class CorsMiddleware implements IMiddleware {
  constructor(private readonly _app: Application) {
    _app.use(this.intercept.bind(this));
  }

  public intercept(request: Request, response: Response, next: NextFunction): void {
    const corsOptions = {
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => {
        if (!origin || ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin))
          return callback(null, true);

        return callback(new ResponseStatus(HTTP_STATUS_CODE_ENUM.FORBBIDEN, "Forbidden"));
      },
    };

    cors(corsOptions)(request, response, next);
  }
}
