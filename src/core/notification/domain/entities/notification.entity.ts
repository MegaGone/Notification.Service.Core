import { PrimitiveNotification } from "./notification.interface";
import { NOTIFICATION_STATE_ENUM } from "../constants/notification-state.enum";

export class NotificationEntity {
  constructor(private readonly _attributes: PrimitiveNotification) {}

  public static create(attributes: PrimitiveNotification): NotificationEntity {
    return new NotificationEntity({
      id: attributes?.id,
      status: attributes?.status,
      response: attributes?.response,
      createdAt: attributes?.createdAt,
      templateID: attributes?.templateID,
      recipients: attributes?.recipients,
      responseException: attributes?.responseException,
    });
  }

  public toPrimitive(): PrimitiveNotification {
    return {
      id: this._attributes?.id,
      status: this._attributes?.status,
      response: this._attributes?.response,
      createdAt: this._attributes?.createdAt,
      templateID: this._attributes?.templateID,
      recipients: this._attributes?.recipients,
      responseException: this._attributes?.responseException,
    };
  }
}
