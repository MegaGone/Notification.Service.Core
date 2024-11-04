import { MiddlewarePort } from "src/presentation/driver/port";
import { Application, NextFunction, Request, Response } from "express";
import { HTTP_STATUS_CODE_ENUM, ResponseStatus } from "src/core/shared";

export class ExceptionMiddlewareApiAdapter implements MiddlewarePort {
    constructor(private readonly _app: Application) {
        console.log("OK!!!!");
    }

    public intercept(
        request: Request,
        response: Response,
        next: NextFunction,
        exception: ResponseStatus = new ResponseStatus(
            HTTP_STATUS_CODE_ENUM.BAD_REQUEST,
            "Internal server error",
        ),
    ) {
        const { statusCode, message } = exception;
        response.status(statusCode).send({ statusCode, message });
        next();
    }
}
