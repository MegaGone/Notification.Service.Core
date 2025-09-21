import { Router } from "express";
import { TemplateRouter } from "src/core/template/presentation/template.routing";

export class MainRouter {
  public static routes(): Router {
    const router = Router();

    router.use("/api/template", TemplateRouter.routes());

    return router;
  }
}
