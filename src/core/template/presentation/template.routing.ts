import { Router } from "express";
import { TemplateController } from "./template.controller";
import { validateFields } from "src/framework/server/middlewares";
import { StoreTemplateDto } from "./validators/store-template.dto";
import { DisableTemplateDto } from "./validators/disable-template.dto";
import { single } from "src/framework/server/middlewares/multer.middleware";
import { DIContainer } from "../../../framework/dependency-inyection/di-container";
import { ScopeMiddleware } from "src/framework/server/middlewares/scope.middeware";
import { FindTemplateByIdentificatorDto } from "./validators/find-template-by-identificator.dto";
import { AuthorizationMiddleware } from "src/framework/server/middlewares/authorization.middleware";

export class TemplateRouter {
  public static routes(): Router {
    const router = Router();
    const container = DIContainer.getInstance();

    router.use(AuthorizationMiddleware.validate);
    router.use(ScopeMiddleware.validate);

    const templateController = new TemplateController(
      container.storeTemplateUseCase,
      container.disableTemplateUseCase,
      container.findTemplateByIdentificatorUseCase,
    );

    router.post(
      "/store",
      single,
      StoreTemplateDto(),
      validateFields,
      templateController.storeTemplate,
    );

    router.get(
      "/:identificator",
      FindTemplateByIdentificatorDto(),
      validateFields,
      templateController.findTemplateByIdentificator,
    );

    router.delete(
      "/:identificator",
      DisableTemplateDto(),
      validateFields,
      templateController.disableTemplate,
    );

    return router;
  }
}
