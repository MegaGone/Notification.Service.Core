import { MiddlewarePort } from "./middleware.interface";
import { LICENSE } from "src/config/global.configuration";
import { Application, Request, Response, NextFunction } from "express";
import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";

export class AuthorizationMiddlewareApiAdapter implements MiddlewarePort {
  constructor(private readonly _app: Application) {
    _app.use(this.intercept.bind(this));
  }

  public intercept(request: Request, response: Response, next: NextFunction): void {
    const header = request.headers["authorization"];

    if (!header) throw ResponseStatus.Unauthorized("Unauthorized");

    const bearer = header.split(" ")[1];

    if (!LICENSE || !bearer || LICENSE !== bearer)
      throw ResponseStatus.Unauthorized("Unauthorized");

    next();
  }
}
