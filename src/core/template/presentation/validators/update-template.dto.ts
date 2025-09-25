import {
  genericFileRule,
  genericStringRule,
  genericStringArrayRule,
} from "src/core/shared/infrastructure/validators/generic-rules.validators";

export const UpdateTemplateDto = () => {
  return [
    genericStringRule(
      "identificator",
      {
        location: "body",
        requiredType: "string",
        warnings: "This field doesn't exist, is not a valid UUID or is empty.",
      },
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ),
    genericStringRule(
      ["sender", "subject", "description"],
      {
        location: "body",
        requiredType: "string",
        warnings: "This field doesn't exist, is not a string or is empty.",
      },
      null,
      false,
    ),
    genericStringArrayRule(
      "fields",
      {
        location: "body",
        requiredType: "array",
        warnings: "This field doesn't exist, is not an array or is empty.",
      },
      null,
      false,
    ),
    genericFileRule(
      "template",
      {
        requiredType: "file",
        warnings: "This field doesn't exist, is not an allowed file or is empty.",
      },
      ["text/plain", "text/html"],
      false,
    ),
  ];
};
