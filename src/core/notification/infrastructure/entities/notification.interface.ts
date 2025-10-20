import { Document } from "typeorm";
import { NOTIFICATION_STATE_ENUM } from "../../domain/constants/notification-state.enum";

export interface MongoNotificationInterface extends Document {
  id?: string;
  createdAt?: Date;
  response?: string;
  templateID: string;
  responseException?: string;
  status: NOTIFICATION_STATE_ENUM;
  recipients: string | Array<string>;
}
