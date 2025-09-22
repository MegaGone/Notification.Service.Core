import { IMiddleware } from "./implementation";
import { BEARER } from "src/configuration/global.configuration";
import { Application, NextFunction, Request, Response } from "express";
import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";

export class AuthorizationMiddleware implements IMiddleware {
  constructor(private readonly _app: Application) {
    _app.use(this.intercept.bind(this));
  }

  public intercept(request: Request, response: Response, next: NextFunction): void {
    next();
  }

  public static validate(request: Request, response: Response, next: NextFunction): void {
    const header = request.headers["authorization"];

    if (!header) throw ResponseStatus.Unauthorized("Unauthorized");

    const bearer = header.split(" ")[1];
    if (!BEARER || !bearer || BEARER !== bearer) throw ResponseStatus.Unauthorized("Unauthorized");

    next();
  }
}
