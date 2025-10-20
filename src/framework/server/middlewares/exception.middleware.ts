import { IMiddleware } from "./implementation";
import { Application, Request, Response, NextFunction } from "express";
import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";
import { HTTP_STATUS_CODE_ENUM } from "src/core/shared/domain/entities/status-code.enum";

export class ExceptionMiddleware implements IMiddleware {
  constructor(private readonly _app: Application) {}

  public intercept(
    request: Request,
    response: Response,
    next: NextFunction,
    exception: ResponseStatus = new ResponseStatus(
      HTTP_STATUS_CODE_ENUM.INTERNAL_SERVER_ERROR,
      "Internal server error",
    ),
  ) {
    const { statusCode, message } = exception;
    response.status(statusCode).json({ statusCode, message });
  }

  public register(): void {
    this._app.use(
      (error: ResponseStatus, request: Request, response: Response, next: NextFunction) => {
        if (error instanceof ResponseStatus) {
          const { statusCode, message } = error;
          return response.status(statusCode).json({ statusCode, message });
        }

        return response.status(HTTP_STATUS_CODE_ENUM.INTERNAL_SERVER_ERROR).json({
          message: "Internal server error",
          statusCode: HTTP_STATUS_CODE_ENUM.INTERNAL_SERVER_ERROR,
        });
      },
    );
  }
}
