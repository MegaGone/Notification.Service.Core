import { version, description } from "package.json";

export const SwaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      version: version,
      description: description,
      title: "Notification.Service.Core",
    },
    servers: [],
    components: {
      schemas: {},
      responses: {},
    },
  },
  apis: ["**/routes/*.ts"],
};
