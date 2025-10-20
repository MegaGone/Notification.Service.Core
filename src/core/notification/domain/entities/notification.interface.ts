import { NOTIFICATION_STATE_ENUM } from "../constants/notification-state.enum";

export interface PrimitiveNotification {
  id?: string;
  createdAt?: Date;
  response?: string;
  templateID: string;
  responseException?: string;
  status: NOTIFICATION_STATE_ENUM;
  recipients: string | Array<string>;
}
