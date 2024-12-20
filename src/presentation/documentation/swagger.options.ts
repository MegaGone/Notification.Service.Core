import { version } from "package.json";

export const SwaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Notification.Service.Core",
      version: version,
      description: "API Rest to handle notification service.",
    },
    servers: [],
    components: {
      securitySchemes: {},
      schemas: {},
      responses: {},
    },
  },
  apis: ["**/routes/*.ts"],
};
