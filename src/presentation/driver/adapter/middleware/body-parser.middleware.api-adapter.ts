import { MiddlewarePort } from "src/presentation/driver/port";
import { Application, Request, Response, NextFunction, json, urlencoded } from "express";

export class BodyParseMiddlewareApiAdapter implements MiddlewarePort {
    constructor(private readonly _app: Application) {
        _app.use(json());
        _app.use(urlencoded({ extended: false }));
    }

    public intercept(request: Request, response: Response, next: NextFunction): void {
        next();
    }
}
