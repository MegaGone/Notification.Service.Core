export type SchemaValidationRule = {
  options?: object;
  required?: boolean;
  itemsType?: "string";
  fields: string | string[];
  matches?: string | RegExp;
  mimeTypes?: Array<string>;
  location?: "body" | "param" | "query param" | "header";
  type: "string" | "number" | "boolean" | "date" | "param" | "query" | "array" | "file";
};
