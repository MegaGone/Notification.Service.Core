import { Application } from "express";
import { ControlPlane } from "src/core/shared/infrastructure";
import { CompanyApiAdapter } from "./infrastructure";

export class CompanyControlPlane extends ControlPlane {
    constructor(private readonly app: Application) {
        super(app);

        this._router = new CompanyApiAdapter(this.app);
    }
}
