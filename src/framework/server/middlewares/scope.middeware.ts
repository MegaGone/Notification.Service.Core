import { IMiddleware } from "./implementation";
import { SCOPE } from "src/configuration/global.configuration";
import { Application, Request, Response, NextFunction } from "express";
import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";

export class ScopeMiddleware implements IMiddleware {
  private static readonly _header: string = "scope";

  constructor(private readonly _app: Application) {
    _app.use(this.intercept.bind(this));
  }

  public intercept(request: Request, response: Response, next: NextFunction): void {
    next();
  }

  public static validate(request: Request, response: Response, next: NextFunction): void {
    const header = request.headers[ScopeMiddleware._header];

    if (!header) throw ResponseStatus.Forbidden("Forbidden");
    if (header !== SCOPE) throw ResponseStatus.Forbidden("Forbidden");

    next();
  }
}
