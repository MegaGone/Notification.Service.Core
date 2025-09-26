export abstract class SmtpProvider {
  public abstract SendEmailWithTemplate(
    sender: string,
    subject: string,
    recipients: string | Array<string>,
    template: string,
  ): Promise<Partial<{ status: number; response: string; responseException: string }>>;
}
