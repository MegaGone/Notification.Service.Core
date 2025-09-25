import {
  StoreTemplateDto,
  UpdateTemplateDto,
  DisableTemplateDto,
  FindTemplatesPaginatedDto,
  FindTemplateByIdentificatorDto,
} from "./validators";
import { Router } from "express";
import { TemplateController } from "./template.controller";
import { validateFields } from "src/framework/server/middlewares";
import { single } from "src/framework/server/middlewares/multer.middleware";
import { DIContainer } from "../../../framework/dependency-inyection/di-container";
import { ScopeMiddleware } from "src/framework/server/middlewares/scope.middeware";
import { AuthorizationMiddleware } from "src/framework/server/middlewares/authorization.middleware";

export class TemplateRouter {
  public static routes(): Router {
    const router = Router();
    const container = DIContainer.getInstance();

    router.use(AuthorizationMiddleware.validate);
    router.use(ScopeMiddleware.validate);

    const templateController = new TemplateController(
      container.storeTemplateUseCase,
      container.updateTemplateUseCase,
      container.disableTemplateUseCase,
      container.findTemplatesPaginatedUseCase,
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
      "/paginated",
      FindTemplatesPaginatedDto(),
      validateFields,
      templateController.findTemplatesPaginated,
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

    router.put(
      "/update",
      single,
      UpdateTemplateDto(),
      validateFields,
      templateController.updateTemplate,
    );

    return router;
  }
}
