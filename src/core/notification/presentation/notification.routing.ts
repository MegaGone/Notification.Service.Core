import { Router } from "express";
import { DIContainer } from "src/framework/dependency-inyection";
import { validateFields } from "src/framework/server/middlewares";
import { NotificationController } from "./notification.controller";
import { SendEmailNotificationDto } from "./validators/send-notification.dto";
import { AuthorizationMiddleware } from "src/framework/server/middlewares/authorization.middleware";

export class NotificationRouter {
  public static routes(): Router {
    const router = Router();
    const container = DIContainer.getInstance();

    router.use(AuthorizationMiddleware.validate);

    const notificationController = new NotificationController(
      container.sendEmailNotificationUseCase,
    );

    router.post(
      "/sendEmail",
      SendEmailNotificationDto(),
      validateFields,
      notificationController.sendEmailNotification,
    );

    return router;
  }
}
