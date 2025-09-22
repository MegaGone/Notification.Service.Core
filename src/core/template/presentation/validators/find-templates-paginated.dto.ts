import {
  genericBooleanRule,
  genericIntegerRule,
} from "src/core/shared/infrastructure/validators/generic-rules.validators";

export const FindTemplatesPaginatedDto = () => {
  return [
    genericIntegerRule(
      ["page", "pageSize"],
      {
        location: "query",
        requiredType: "number",
        warnings: "This field doesn't exist, is not a number or is empty.",
      },
      true,
    ),
    genericBooleanRule(
      "enabled",
      {
        location: "query",
        requiredType: "boolean",
        warnings: "This field doesn't exist, is not a boolean or is empty.",
      },
      false,
    ),
  ];
};
