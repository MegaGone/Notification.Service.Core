import { Request, Response } from "express";
import { SendNotificationOrchestrator } from "../application";
import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";

export class NotificationController {
  constructor(private readonly _sendNotificationUseCase: SendNotificationOrchestrator) {}

  public sendNotification = (req: Request, res: Response) => {
    const { templateID, fields, recipients } = req.body;

    this._sendNotificationUseCase
      .execute({ templateID, fields, recipients })
      .then((result) => res.json(result))
      .catch((error: ResponseStatus) => res.status(error?.statusCode).json(error));
  };
}
