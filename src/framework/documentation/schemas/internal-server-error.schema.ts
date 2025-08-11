import { OpenAPIV3 } from "openapi-types";
import { HTTP_STATUS_CODE_ENUM } from "src/core/shared/domain/status-code.enum";

export const InternalException: OpenAPIV3.ResponseObject = {
  description: "Internal server error",
  content: {
    "application/json": {
      schema: {
        type: "object",
        example: {
          message: "Internal server error.",
          statusCode: HTTP_STATUS_CODE_ENUM.INTERNAL_SERVER_ERROR,
        },
      },
    },
  },
};
