import {
  genericFileRule,
  genericParamRule,
  genericStringRule,
  genericIntegerRule,
  genericBooleanRule,
  genericQueryParamRule,
  genericStringArrayRule,
} from "./generic-rules.validators";
import { ValidationChain } from "express-validator";
import { SchemaValidationRule } from "../../application/validators/generic-schema.validator";

export const requestValidator = (schema: Array<SchemaValidationRule>): Array<ValidationChain> => {
  const rules = schema?.map((rule: SchemaValidationRule) => {
    switch (rule?.type) {
      case "string":
        return genericStringRule(
          rule?.fields,
          {
            requiredType: rule?.type,
            location: rule?.location,
            warnings:
              `This field doesn't exist, is not a string` +
              (rule?.required != false ? " or is empty" : "") +
              (rule?.matches ? ` and must match the pattern: ${rule.matches}` : "") +
              ".",
          },
          rule?.matches,
          rule?.required,
        );
      case "number":
        return genericIntegerRule(
          rule?.fields,
          {
            requiredType: rule?.type,
            location: rule?.location,
            warnings: "This field doesn't exist, is not a integer or is empty.",
          },
          rule?.options,
          rule?.required,
        );
      case "boolean":
        return genericBooleanRule(
          rule?.fields,
          {
            requiredType: rule?.type,
            location: rule?.location,
            warnings: "This field doesn't exist, is not a boolean or is empty.",
          },
          rule?.required,
        );
      case "query":
        return genericQueryParamRule(
          rule?.fields,
          {
            requiredType: "string",
            location: rule?.location,
            warnings: "This field doesn't exist in query param, is not a string or is empty.",
          },
          rule?.required,
        );
      case "param":
        return genericParamRule(
          rule?.fields,
          {
            requiredType: "string",
            location: rule?.location,
            warnings:
              `This field doesn't exist, is not a string` +
              (rule?.required != false ? " or is empty" : "") +
              (rule?.matches ? ` and must match the pattern: ${rule.matches}` : "") +
              ".",
          },
          rule?.required,
          rule?.matches,
        );
      case "date":
        return genericStringRule(
          ["startDate", "endDate"],
          {
            requiredType: "string",
            location: rule?.location,
            warnings: `This field doesn't exist, is not a string or is empty.`,
          },
          /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
        );
      case "array":
        return genericStringArrayRule(
          rule?.fields,
          {
            requiredType: rule?.type,
            location: rule?.location,
            warnings:
              `This field doesn't exist, is not a string` +
              (rule?.required != false ? " or is empty" : "") +
              (rule?.matches ? ` and must match the pattern: ${rule.matches}` : "") +
              ".",
          },
          rule?.matches,
          rule?.required,
        );
      case "file":
        return genericFileRule(
          rule?.fields,
          {
            requiredType: "file",
            warnings: `This field doesn't exist, is not an allowed file or is empty.`,
          },
          rule?.mimeTypes,
          rule?.required,
        );
    }
  });

  return rules;
};
