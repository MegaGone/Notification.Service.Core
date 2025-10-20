import { NOTIFICATION_STATE_ENUM } from "../constants/notification-state.enum";

export interface SmtpResponse {
  emailId?: string;
  response?: string;
  responseException?: string;
  status: NOTIFICATION_STATE_ENUM;
}
