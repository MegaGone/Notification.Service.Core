import cors from "cors";
import { Application, Request, Response, NextFunction } from "express";

import { ALLOWED_ORIGINS } from "src/config";
import { HTTP_STATUS_CODE_ENUM, ResponseStatus } from "src/core/shared";
import { MiddlewarePort } from "src/presentation/driver/port";

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
