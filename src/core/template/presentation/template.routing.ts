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

    /**
     * @swagger
     * /api/template/store:
     *   post:
     *     summary: Store template
     *     tags: [Template]
     *     security:
     *      - AuthorizationBearerSchema: []
     *      - ScopeSchema: []
     *     requestBody:
     *       required: true
     *       content:
     *          multipart/form-data:
     *            schema:
     *              type: object
     *              required:
     *                - sender
     *                - fields
     *                - subject
     *                - template
     *                - description
     *              properties:
     *               sender:
     *                   type: string
     *                   description: Email template sender
     *                   example: devops@sbxsoft.com
     *               subject:
     *                   type: string
     *                   description: Email template subject
     *                   example: Restore password
     *               description:
     *                   type: string
     *                   description: Template description
     *                   example: Email to restore password.
     *               template:
     *                   type: file
     *                   format: binary
     *                   description: Email template body
     *                   example: template.html
     *               fields:
     *                   type: array
     *                   description: Fields to set dynamically in body template
     *                   items:
     *                      type: string
     *                   example: ["username", "timestamp"]
     *     responses:
     *       200:
     *         description: Template stored
     *         content:
     *           application/json:
     *             example:
     *               stored: true
     *               id: 9df43680-0707-4a48-9512-506d2ed4301f
     *       400:
     *         description: Another template exists with the same description.
     *         content:
     *           application/json:
     *             example:
     *               statusCode: 400
     *               message: Cannot duplicate templates by description.
     *       401:
     *        $ref: '#/components/responses/UnauthorizedException'
     *       422:
     *        $ref: '#/components/responses/FieldException'
     *       500:
     *        $ref: '#/components/responses/InternalException'
     */
    router.post(
      "/store",
      single,
      StoreTemplateDto(),
      validateFields,
      templateController.storeTemplate,
    );

    /**
     * @swagger
     * /api/template/paginated:
     *   get:
     *     summary: Get templates paginated
     *     tags: [Template]
     *     security:
     *      - AuthorizationBearerSchema: []
     *      - ScopeSchema: []
     *     parameters:
     *       - in: query
     *         name: page
     *         required: true
     *         schema:
     *           type: number
     *         description: Page number
     *         example: 1
     *       - in: query
     *         name: pageSize
     *         required: true
     *         schema:
     *           type: number
     *         description: Records by page
     *         example: 10
     *     responses:
     *       200:
     *         description: Templates found
     *         content:
     *           application/json:
     *             schema:
     *              type: object
     *              properties:
     *                statusCode:
     *                  type: integer
     *                  example: 200
     *                templates:
     *                  type: array
     *                  items:
     *                    $ref: '#/components/schemas/GenericTemplate'
     *       401:
     *        $ref: '#/components/responses/UnauthorizedException'
     *       422:
     *        $ref: '#/components/responses/FieldException'
     *       500:
     *        $ref: '#/components/responses/InternalException'
     */
    router.get(
      "/paginated",
      FindTemplatesPaginatedDto(),
      validateFields,
      templateController.findTemplatesPaginated,
    );

    /**
     * @swagger
     * /api/template/{identificator}:
     *   get:
     *     summary: Find template by id
     *     tags: [Template]
     *     security:
     *      - AuthorizationBearerSchema: []
     *      - ScopeSchema: []
     *     parameters:
     *       - in: path
     *         name: identificator
     *         required: true
     *         schema:
     *           type: string
     *         description: Template Identificator
     *         example: 9df43680-0707-4a48-9512-506d2ed4301f
     *     responses:
     *       200:
     *         description: Template found
     *         content:
     *           application/json:
     *             example:
     *               statusCode: 200
     *               templates: [...]
     *       401:
     *        $ref: '#/components/responses/UnauthorizedException'
     *       404:
     *         description: Template not found.
     *         content:
     *           application/json:
     *             example:
     *               statusCode: 404
     *               message: Template not found.
     *       422:
     *        $ref: '#/components/responses/FieldException'
     *       500:
     *        $ref: '#/components/responses/InternalException'
     */
    router.get(
      "/:identificator",
      FindTemplateByIdentificatorDto(),
      validateFields,
      templateController.findTemplateByIdentificator,
    );

    /**
     * @swagger
     * /api/template/{id}:
     *   delete:
     *     summary: Disable template by id
     *     tags: [Template]
     *     security:
     *      - AuthorizationBearerSchema: []
     *      - ScopeSchema: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Template ID
     *         example: 9df43680-0707-4a48-9512-506d2ed4301f
     *     responses:
     *       200:
     *         description: Template disabled
     *         content:
     *           application/json:
     *             example:
     *               statusCode: 200
     *               disabled: true
     *       401:
     *        $ref: '#/components/responses/UnauthorizedException'
     *       404:
     *         description: Template not found.
     *         content:
     *           application/json:
     *             example:
     *               statusCode: 404
     *               message: Template not found.
     *       422:
     *        $ref: '#/components/responses/FieldException'
     *       500:
     *        $ref: '#/components/responses/InternalException'
     */
    router.delete(
      "/:identificator",
      DisableTemplateDto(),
      validateFields,
      templateController.disableTemplate,
    );

    /**
     * @swagger
     * /api/template/update:
     *   put:
     *     summary: Update template
     *     tags: [Template]
     *     security:
     *      - AuthorizationBearerSchema: []
     *      - ScopeSchema: []
     *     requestBody:
     *       required: true
     *       content:
     *          multipart/form-data:
     *            schema:
     *              type: object
     *              required:
     *                - identificator
     *              properties:
     *               identificator:
     *                   type: string
     *                   description: Template Identificator
     *                   example: 9df43680-0707-4a48-9512-506d2ed4301f
     *               sender:
     *                   type: string
     *                   description: Email template sender
     *                   example: devops@sbxsoft.com
     *               subject:
     *                   type: string
     *                   description: Email template subject
     *                   example: Restore your password
     *               description:
     *                   type: string
     *                   description: Template description
     *                   example: Email to restore password.
     *               template:
     *                   type: file
     *                   format: binary
     *                   description: Email template body
     *                   example: template.html
     *               fields:
     *                   type: array
     *                   description: Fields to set dynamically in body template
     *                   items:
     *                      type: string
     *                   example: ["username", "timestamp"]
     *     responses:
     *       200:
     *         description: Template updated
     *         content:
     *           application/json:
     *             example:
     *               updated: true
     *       400:
     *         description: Another template exists with the same description or Template is not enabled.
     *         content:
     *           application/json:
     *             example:
     *               statusCode: 400
     *               message: Cannot duplicate templates by description or Template is not enabled.
     *       401:
     *        $ref: '#/components/responses/UnauthorizedException'
     *       404:
     *         description: Template not found.
     *         content:
     *           application/json:
     *             example:
     *               statusCode: 404
     *               message: Template not found.
     *       422:
     *        $ref: '#/components/responses/FieldException'
     *       500:
     *        $ref: '#/components/responses/InternalException'
     */
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
