import {
  genericFileRule,
  genericStringRule,
  genericStringArrayRule,
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
