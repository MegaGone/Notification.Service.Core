import { IMiddleware } from "./implementation";
import { validationResult } from "express-validator";
import { Application, Request, Response, NextFunction } from "express";
import { HTTP_STATUS_CODE_ENUM } from "src/core/shared/domain/entities/status-code.enum";

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationMiddleware implements IMiddleware {
  private static _instance: ValidationMiddleware;

  private constructor(private readonly _app?: Application) {}

  public static getInstance(app?: Application): ValidationMiddleware {
    if (!ValidationMiddleware._instance) {
      ValidationMiddleware._instance = new ValidationMiddleware(app);
    }
    return ValidationMiddleware._instance;
  }

  public static validateFields = (request: Request, response: Response, next: NextFunction) => {
    return ValidationMiddleware.getInstance().intercept(request, response, next);
  };

  public intercept(request: Request, response: Response, next: NextFunction): void | Response {
    const errors = validationResult(request);
    if (errors.isEmpty()) return next();

    const uniqueErrors: ValidationError[] = [];
    const processedFields = new Set<string>();

    errors.array().forEach((error) => {
      const fieldName = error.param || "unknown";

      if (!processedFields.has(fieldName)) {
        processedFields.add(fieldName);
        uniqueErrors.push({
          field: fieldName,
          message: error.msg || "Validation error",
        });
      }
    });

    return response.status(HTTP_STATUS_CODE_ENUM.REQUEST_UNPROCESSABLE).json({
      statusCode: HTTP_STATUS_CODE_ENUM.REQUEST_UNPROCESSABLE,
      message: "Validation failed",
      errors: uniqueErrors,
    });
  }
}

// UNIQUE INSTANCE
export const validateFields = ValidationMiddleware.validateFields;
