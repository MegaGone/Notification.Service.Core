import { Model } from "mongoose";
import { NotificationEntity } from "../../domain/entities/notification.entity";
import { MongoNotificationInterface } from "../entities/notification.interface";
import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";
import { NotificationRepository } from "../../domain/repositories/notification.repository";

export class MongoNotificationRepository implements NotificationRepository {
  private readonly _model: Model<MongoNotificationInterface>;

  constructor(model: Model<MongoNotificationInterface>) {
    this._model = model;
  }

  public async store(notification: NotificationEntity): Promise<void> {
    try {
      await this._model.create({
        ...notification.toPrimitive(),
        recipients: notification.toPrimitive().recipients.toString(),
      });
    } catch (error) {
      console.log(`[ERROR][INFRA][MONGO NOTIFICATION REPO][STORE] ${error}`);
      throw ResponseStatus.InternalServer("Internal server error.");
    }
  }
}
