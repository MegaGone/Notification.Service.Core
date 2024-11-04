import { Application } from "express";
import { RouterPort } from "./router-port.model";

export class ControlPlane {
    protected _router!: RouterPort;

    constructor(private readonly _app: Application) {}

    public get Router(): RouterPort {
        return this._router;
    }
}
