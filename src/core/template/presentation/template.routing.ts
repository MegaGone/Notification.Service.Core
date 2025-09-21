import { Router } from "express";
import { TemplateController } from "./template.controller";
import { single } from "src/framework/server/middlewares/multer.middleware";
import { DIContainer } from "../../../framework/dependency-inyection/di-container";
import { StoreTemplateDto } from "./validators/store-template.dto";
import { validateFields } from "src/framework/server/middlewares";

export class TemplateRouter {
  public static routes(): Router {
    const router = Router();
    const container = DIContainer.getInstance();

    const templateController = new TemplateController(
      container.storeTemplateUseCase,
      container.disableTemplateUseCase,
    );

    router.post(
      "/store",
      single,
      StoreTemplateDto(),
      validateFields,
      templateController.storeTemplate,
    );

    // DELETE /templates/:id - Desactivar un template por ID
    router.delete("/:id", templateController.disableTemplate);

    return router;
  }
}
