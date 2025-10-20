import { OpenAPIV3 } from "openapi-types";

export const ScopeSchema: OpenAPIV3.SecuritySchemeObject = {
  in: "header",
  type: "apiKey",
  name: "scope",
  description: "Application scope header required for API access.",
};
