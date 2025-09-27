import {
  genericFileRule,
  genericStringRule,
  genericStringArrayRule,
  genericIntegerRule,
} from "src/core/shared/infrastructure/validators/generic-rules.validators";

export const StoreTemplateDto = () => {
  return [
    genericStringRule(
      ["sender", "subject", "description"],
      {
        location: "body",
        requiredType: "string",
        warnings: "This field doesn't exist, is not a string or is empty.",
      },
      null,
    ),
    genericStringArrayRule(
      "fields",
      {
        location: "body",
        requiredType: "array",
        warnings: "This field doesn't exist, is not an array or is empty.",
      },
      null,
    ),
    genericIntegerRule(
      "type",
      {
        location: "body",
        requiredType: "number",
        warnings: "This field doesn't exist, is not a number or is empty.",
      },
      {},
    ),
    genericFileRule(
      "template",
      {
        requiredType: "file",
        warnings: "This field doesn't exist, is not an allowed file or is empty.",
      },
      ["text/plain", "text/html"],
    ),
  ];
};
