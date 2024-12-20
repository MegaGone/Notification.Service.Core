import swaggerJSDoc from "swagger-jsdoc";
import SwaggerUI from "swagger-ui-express";

export class SwaggerClient {
  private _specs: object;

  constructor(options: object) {
    this._specs = swaggerJSDoc(options);
  }

  public setup() {
    return SwaggerUI.setup(this._specs);
  }

  public serve() {
    return SwaggerUI.serve;
  }
}
