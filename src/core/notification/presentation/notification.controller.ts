import { Request, Response } from "express";
import { SendEmailOrchestrator } from "../application";
import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";

export class NotificationController {
  constructor(private readonly _sendEmailNotificationUseCase: SendEmailOrchestrator) {}

  public sendEmailNotification = (req: Request, res: Response) => {
    const { templateID, fields, recipients } = req.body;

    this._sendEmailNotificationUseCase
      .execute({ templateID, fields, recipients })
      .then((result) => res.json(result))
      .catch((error: ResponseStatus) => res.status(error?.statusCode).json(error));
  };
}
