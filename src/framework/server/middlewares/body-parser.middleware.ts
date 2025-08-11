import { IMiddleware } from "./implementation";
import { Application, Request, Response, NextFunction, json, urlencoded } from "express";

export class BodyParseMiddleware implements IMiddleware {
  constructor(private readonly _app: Application) {
    _app.use(json());
    _app.use(urlencoded({ extended: true }));
  }

  public intercept(request: Request, response: Response, next: NextFunction): void {
    next();
  }
}
