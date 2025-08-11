import { OpenAPIV3 } from "openapi-types";

export const FieldException: OpenAPIV3.ResponseObject = {
  description: "Fields exception",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          errors: {
            type: "object",
            example: {
              errors: [
                {
                  field: "description",
                  message: {
                    requiredType: "string",
                    warnings: "The field does not exist, is not a string or is empty.",
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
};
