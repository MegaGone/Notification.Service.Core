import { OpenAPIV3 } from "openapi-types";
import { HTTP_STATUS_CODE_ENUM } from "src/core/shared/domain/entities/status-code.enum";

export const UnauthorizedException: OpenAPIV3.ResponseObject = {
  description: "Unauthorize",
  content: {
    "application/json": {
      schema: {
        type: "object",
        example: {
          message: "Unauthorized.",
          statusCode: HTTP_STATUS_CODE_ENUM.UNAUTHORIZE,
        },
      },
    },
  },
};
