import { API_PREFIX, API_VERSION } from "src/config";

export class RouterPort {
    private readonly _prefix: string;
    private readonly _version: string;

    constructor() {
        this._prefix = API_PREFIX;
        this._version = API_VERSION;
    }

    protected getPath(route: string): string {
        if (!route) throw new Error("Route not provided");

        console.log(route);
        return `/${this._prefix}/${this._version}/${route}`;
    }
}
