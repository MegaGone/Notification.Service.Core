import { NotificationEntity } from "../entities/notification.entity";

export abstract class NotificationRepository {
  public abstract store(notification: NotificationEntity): Promise<void>;
}
