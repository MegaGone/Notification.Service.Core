import { SmtpResponse } from "./smtp-response.interface";

export abstract class SmtpProvider {
  public abstract SendEmailWithTemplate(
    sender: string,
    subject: string,
    recipients: string | Array<string>,
    template: string,
  ): Promise<SmtpResponse>;
}
