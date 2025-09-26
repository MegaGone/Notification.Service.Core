import { Resend } from "resend";
import { SmtpProvider } from "../../domain/providers/smtp.provider";
import { RESEND_API_KEY } from "src/configuration/resend.configuration";
import { NOTIFICATION_STATE_ENUM } from "../../domain/constants/notification-state.enum";

export class ResendSmtpProvider implements SmtpProvider {
  private readonly _client: Resend;

  constructor() {
    this._client = new Resend(RESEND_API_KEY);
  }

  public async SendEmailWithTemplate(
    sender: string,
    subject: string,
    recipients: string | Array<string>,
    template: string,
  ): Promise<Partial<{ status: number; response: string; responseException: string }>> {
    try {
      const { data, error } = await this._client.emails.send({
        from: sender,
        to: recipients,
        html: template,
        subject: subject,
      });

      return {
        response: data ? JSON.stringify(data) : "",
        responseException: error ? `[RESEND] ${JSON.stringify(error)}` : "",
        status: error ? NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE : NOTIFICATION_STATE_ENUM.SENT,
      };
    } catch (error) {
      console.log(`[ERROR][SERVICE][RESEND][SEND_EMAIL_WITH_TEMPLATE] ${JSON.stringify(error)}`);
      return {
        status: NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE,
        responseException: `[RESEND] ${JSON.stringify(error)}`,
      };
    }
  }
}
