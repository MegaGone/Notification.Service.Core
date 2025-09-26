import {
  genericStringRule,
  genericDictionaryRule,
  genericStringArrayRule,
} from "src/core/shared/infrastructure/validators/generic-rules.validators";

export const SendNotificationDto = () => {
  return [
    genericStringRule(
      "templateID",
      {
        location: "body",
        requiredType: "string",
        warnings: "This field doesn't exist, is not a string or is empty.",
      },
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ),
    genericDictionaryRule(
      "fields",
      {
        location: "body",
        requiredType: "object",
        warnings: "This field doesn't exist, is not an object or is empty.",
      },
      ["string", "number", "boolean"],
    ),
    genericStringArrayRule(
      "recipients",
      {
        location: "body",
        requiredType: "array",
        warnings: "This field doesn't exist, is not an array or is empty.",
      },
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    ),
  ];
};
