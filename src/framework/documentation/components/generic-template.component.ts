import { OpenAPIV3 } from "openapi-types";

export const GenericTemplate: OpenAPIV3.SchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", example: "680300e23a5e28cfb8708ce0" },
    from: { type: "string", example: "devops@sbxsoft.com" },
    fields: {
      type: "array",
      items: { type: "string" },
      example: ["username", "timestamp"],
    },
    enabled: { type: "integer", example: 1 },
    subject: { type: "string", example: "Restore password" },
    createdAt: {
      type: "string",
      format: "date-time",
      example: "2025-04-20T01:48:18.020Z",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
      example: "2025-04-20T01:48:18.020Z",
    },
    templateId: {
      type: "string",
      example: "gqncp1msth2nse55btdy.html",
    },
    description: {
      type: "string",
      example: "Email to restore password.",
    },
    identificator: {
      type: "string",
      example: "9df43680-0707-4a48-9512-506d2ed4301f",
    },
  },
};
