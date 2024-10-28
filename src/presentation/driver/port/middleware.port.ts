import { ResponseStatus } from "src/core/shared/domain";
import { Request, Response, NextFunction } from "express";

export interface MiddlewarePort {
    intercept(
        request: Request,
        response: Response,
        next: NextFunction,
        exception?: ResponseStatus,
    ): void | Response<unknown, Record<string, unknown>>;
}
