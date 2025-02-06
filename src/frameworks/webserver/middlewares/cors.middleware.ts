import cors from "cors";
import { MiddlewarePort } from "./middleware.interface";
import { ALLOWED_ORIGINS } from "src/config/global.configuration";
import { Application, Request, Response, NextFunction } from "express";
import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";
import { HTTP_STATUS_CODE_ENUM } from "src/core/shared/domain/enums/status-code.enum";

export class CorsMiddlewareApiAdapter implements MiddlewarePort {
  constructor(private readonly _app: Application) {
    _app.use(this.intercept.bind(this));
  }

  public intercept(request: Request, response: Response, next: NextFunction): void {
    const corsOptions = {
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => {
        if (!origin || ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin)) {
          return callback(null, true);
        }

        return callback(new ResponseStatus(HTTP_STATUS_CODE_ENUM.FORBBIDEN, "Forbbiden"));
      },
    };

    cors(corsOptions)(request, response, next);
  }
}
