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

    /**
     * @swagger
     * /api/notification/sendEmail:
     *   post:
     *     summary: Send email notification
     *     tags: [Notification]
     *     security:
     *      - AuthorizationBearerSchema: []
     *     requestBody:
     *       required: true
     *       content:
     *          application/json:
     *            schema:
     *              type: object
     *              required:
     *                - templateID
     *                - recipients
     *                - fields
     *              properties:
     *               templateID:
     *                   type: string
     *                   description: Template ID
     *                   example: 9df43680-0707-4a48-9512-506d2ed4301f
     *               recipients:
     *                   type: array
     *                   description: Recipients email addresses
     *                   items:
     *                      type: string
     *                   example: ["user@example.com", "user2@example.com"]
     *               fields:
     *                   type: array
     *                   description: Fields to set dynamically in body template
     *                   items:
     *                      type: string
     *                      description: Field name
     *                      example: username
     *                   example: ["username", "timestamp"]
     *     responses:
     *       200:
     *         description: Email notification sent
     *         content:
     *           application/json:
     *             example:
     *               sent: true
     *       400:
     *         description: Invalid template ID, recipients or fields.
     *         content:
     *           application/json:
     *             example:
     *               statusCode: 400
     *               message: Invalid template ID, recipients or fields.
     *       401:
     *        $ref: '#/components/responses/UnauthorizedException'
     *       422:
     *        $ref: '#/components/responses/FieldException'
     *       500:
     *        $ref: '#/components/responses/InternalException'
     */
    router.post(
      "/sendEmail",
      SendEmailNotificationDto(),
      validateFields,
      notificationController.sendEmailNotification,
    );

    return router;
  }
}
