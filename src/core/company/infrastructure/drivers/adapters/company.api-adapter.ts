import { Request, Response, NextFunction, Application } from "express";
import { RouterPort } from "src/core/shared/infrastructure";
import { CompanyApiPort } from "src/core/company/infrastructure";
import { HTTP_STATUS_CODE_ENUM, ResponseStatus } from "src/core";

export class CompanyApiAdapter extends RouterPort implements CompanyApiPort {
    private readonly _route: string;

    constructor(private readonly _app: Application) {
        super();
        this._route = "company";

        const main: string = this.getPath(this._route);
        this._app.post(`${main}/sign-up`, this.register.bind(this));
    }

    public async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { password } = req.body;
            if (!password) throw ResponseStatus.BadRequest("test");

            res.status(200).json({ ok: true });
        } catch (error) {
            next(error);
        }
    }
}
