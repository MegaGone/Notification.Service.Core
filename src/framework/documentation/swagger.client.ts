import swaggerJSDoc from "swagger-jsdoc";
import SwaggerUI from "swagger-ui-express";

export class SwaggerClient {
  private specs: object;

  constructor(options: object) {
    this.specs = swaggerJSDoc(options);
  }

  public setup() {
    return SwaggerUI.setup(this.specs);
  }

  public serve() {
    return SwaggerUI.serve;
  }
}
