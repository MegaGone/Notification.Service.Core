import { StoreNotificationLogDto } from "./store-notification-log.dto";
import { NotificationEntity } from "../../domain/entities/notification.entity";
import { NotificationRepository } from "../../domain/repositories/notification.repository";

export class StoreNotificationLogUseCase {
  constructor(private readonly _notificationRepository: NotificationRepository) {}

  public async execute(dto: StoreNotificationLogDto): Promise<void> {
    await this._notificationRepository.store(NotificationEntity.create(dto));
  }
}
