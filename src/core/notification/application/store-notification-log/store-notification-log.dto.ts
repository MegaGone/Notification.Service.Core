import { NOTIFICATION_STATE_ENUM } from "../../domain/constants/notification-state.enum";

export interface StoreNotificationLogDto {
  response?: string;
  templateID: string;
  responseException?: string;
  status: NOTIFICATION_STATE_ENUM;
  recipients: string | Array<string>;
}
