import { OpenAPIV3 } from "openapi-types";

export const AuthorizationBearerSchema: OpenAPIV3.SecuritySchemeObject = {
  in: "header",
  type: "apiKey",
  name: "Authorization",
};
