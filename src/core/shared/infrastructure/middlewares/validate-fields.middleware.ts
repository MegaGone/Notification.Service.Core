import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS_CODE_ENUM } from "../../domain/status-code.enum";
import { FieldValidationError } from "../../application/validators/field.type";

export const validateFields = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const uniqueErrors: FieldValidationError[] = [];
  errors.array().forEach((error) => {
    if (!uniqueErrors.some((uniqueError) => uniqueError.field === error.param)) {
      uniqueErrors.push({
        field: error.param,
        message: error.msg,
      });
    }
  });

  return res.status(HTTP_STATUS_CODE_ENUM.REQUEST_UNPROCESSABLE).json({
    errors: uniqueErrors,
  });
};
