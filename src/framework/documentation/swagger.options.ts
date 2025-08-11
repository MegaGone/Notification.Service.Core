import { GenericTemplate } from "./components";
import {
  FieldException,
  InternalException,
  UnauthorizedException,
  GenericTemplateResponse,
  AuthorizationBearerSchema,
} from "./schemas";
import { version, description } from "package.json";

export const SwaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      version: version,
      description: description,
      title: "Notification.Core.API",
    },
    servers: [],
    components: {
      securitySchemes: {
        AuthorizationBearerSchema,
      },
      schemas: {
        GenericTemplate,
      },
      responses: {
        FieldException,
        InternalException,
        UnauthorizedException,
        GenericTemplate: GenericTemplateResponse,
      },
    },
  },
  apis: ["src/core/**/presentation/**/*.routing.ts"],
};
