import { Router } from "express";
import { TemplateRouter } from "src/core/template/presentation/template.routing";
import { NotificationRouter } from "src/core/notification/presentation/notification.routing";

export class MainRouter {
  public static routes(): Router {
    const router = Router();

    router.use("/template", TemplateRouter.routes());
    router.use("/notification", NotificationRouter.routes());

    return router;
  }
}
