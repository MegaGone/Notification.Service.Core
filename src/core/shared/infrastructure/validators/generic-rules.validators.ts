import { check, query, param } from "express-validator";
import { FieldValidationMessage } from "../../application/validators/field.type";

export const genericStringRule = (
  field: string | string[],
  message: FieldValidationMessage,
  matches: string | null | RegExp = null,
  required: boolean = true,
) => {
  const stringRule = check(field, message);

  required ? stringRule.exists() : stringRule.optional();

  stringRule.notEmpty().isString();
  if (matches) stringRule.matches(matches);
  return stringRule;
};

export const genericIntegerRule = (
  field: string | string[],
  message: FieldValidationMessage,
  options = {},
  required: boolean = true,
) => {
  const integerRule = check(field, message);
  required ? integerRule.exists() : integerRule.optional();
  return integerRule.toInt().isInt(options);
};

export const genericFloatRule = (
  field: string | string[],
  message: FieldValidationMessage,
  options = {},
  required: boolean = true,
) => {
  const floatRule = check(field, message);
  required ? floatRule.exists() : floatRule.optional();
  return floatRule.toFloat().isFloat(options);
};

export const genericBooleanRule = (
  field: string | string[],
  message: FieldValidationMessage,
  required = true,
) => {
  const booleanRule = check(field, message);
  required ? booleanRule.exists() : booleanRule.optional();
  return booleanRule.isBoolean();
};

export const genericRolesRule = (
  field: string | string[],
  message: FieldValidationMessage,
  roles: string[],
  required: boolean = true,
) => {
  const rolesRule = check(field, message);
  required ? rolesRule.exists() : rolesRule.optional();

  rolesRule.isIn(roles);

  return rolesRule;
};

export const genericQueryParamRule = (
  field: string | string[],
  message: FieldValidationMessage,
  required: boolean = true,
) => {
  const queryParamRule = query(field, message);
  required ? queryParamRule.exists() : queryParamRule.optional();

  queryParamRule.notEmpty().isString().matches(/^\d+$/);

  return queryParamRule;
};

export const genericParamRule = (
  field: string | string[],
  message: FieldValidationMessage,
  required: boolean = true,
  matches: string | RegExp | null = null,
) => {
  let paramRule = param(field, message);
  required ? paramRule.exists({ checkNull: true, checkFalsy: true }) : paramRule.optional();

  paramRule = paramRule.notEmpty();

  if (matches) paramRule = paramRule.matches(matches);

  return paramRule;
};

export const genericStringArrayRule = (
  field: string | string[],
  message: FieldValidationMessage,
  matches: string | null | RegExp = null,
  required: boolean = true,
) => {
  const arrayRule = check(field, message).isArray();

  required ? arrayRule.exists({ checkNull: true, checkFalsy: true }) : arrayRule.optional();

  arrayRule.custom((value: unknown) => {
    if (!Array.isArray(value)) return false;

    for (const element of value) {
      if (typeof element !== "string") return false;

      if (matches && !element.match(matches)) return false;
    }

    return true;
  });

  return arrayRule;
};

export const genericFileRule = (
  field: string | Array<string>,
  message: FieldValidationMessage,
  mimetypes: Array<string> | null = null,
  required: boolean = true,
) => {
  let fileRule = check(field).custom((_, { req }) => {
    const file = req.file;

    if (!file || !file.path) throw new Error(message.warnings);

    if (mimetypes && !mimetypes.includes(file.mimetype))
      throw new Error(`File type ${file.mimetype} not allowed`);

    return true;
  });

  if (!required) fileRule = fileRule.optional();

  return fileRule;
};

export const genericDictionaryRule = (
  field: string | string[],
  message: FieldValidationMessage,
  allowedValueTypes: Array<"string" | "number" | "boolean"> = ["string", "number", "boolean"],
  required: boolean = true,
) => {
  const dictionaryRule = check(field, message);

  required ? dictionaryRule.exists() : dictionaryRule.optional();

  dictionaryRule.custom((value: unknown) => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return false;

    const entries = Object.entries(value);

    if (entries.length === 0) return false;

    for (const [key, val] of entries) {
      if (typeof key !== "string" || key.trim() === "") return false;

      if (val === null || val === undefined) return false;

      const valueType = typeof val;

      if (!allowedValueTypes.includes(valueType as "string" | "number" | "boolean")) return false;

      switch (valueType) {
        case "string":
          if ((val as string).trim() === "") return false;
          break;

        case "number":
          if (isNaN(val as number) || !isFinite(val as number)) return false;
          break;

        case "boolean":
          break;
      }
    }

    return true;
  });

  return dictionaryRule;
};
