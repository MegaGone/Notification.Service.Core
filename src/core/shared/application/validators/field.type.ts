type FieldValidationError = {
  field: string;
  message: Record<string, string>;
};

type FieldValidationMessage = {
  warnings: string;
  location?: string;
  requiredType: string;
};

export { FieldValidationMessage, FieldValidationError };
