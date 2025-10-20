import { OpenAPIV3 } from "openapi-types";

export const GenericTemplateResponse: OpenAPIV3.ResponseObject = {
  description: "Generic template",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/GenericTemplate",
      },
    },
  },
};
