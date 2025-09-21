import { genericStringRule } from "src/core/shared/infrastructure/validators/generic-rules.validators";

export const FindTemplateByIdentificatorDto = () => {
  return [
    genericStringRule(
      "identificator",
      {
        location: "param",
        requiredType: "string",
        warnings: "This field doesn't exist, is not a valid UUID or is empty.",
      },
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ),
  ];
};
