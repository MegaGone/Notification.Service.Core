import { Request, Response, NextFunction } from "express";
import { ResponseStatus } from "src/core/shared/domain/response-status.model";

export interface IMiddleware {
  intercept(
    request: Request,
    response: Response,
    next: NextFunction,
    exception?: ResponseStatus,
  ): void | Response<unknown, Record<string, unknown>>;
}
