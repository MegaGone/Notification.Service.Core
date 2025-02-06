import { MiddlewarePort } from "./middleware.interface";
import { NextFunction, Request, Response } from "express";
import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";
import { HTTP_STATUS_CODE_ENUM } from "src/core/shared/domain/enums/status-code.enum";

export const ExceptionMiddlewareApiAdapter: MiddlewarePort = {
  intercept(
    request: Request,
    response: Response,
    next: NextFunction,
    exception: ResponseStatus = new ResponseStatus(
      HTTP_STATUS_CODE_ENUM.INTERNAL_SERVER_ERROR,
      "Internal server error",
    ),
  ) {
    const { statusCode, message } = exception;
    response.status(statusCode).send({ statusCode, message });
    next();
  },
};
