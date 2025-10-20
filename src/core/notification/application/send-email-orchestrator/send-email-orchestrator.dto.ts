export interface SendNotificationOrchestratorDto {
  templateID: string;
  fields: Record<string, unknown>;
  recipients: string | Array<string>;
}

export class SendNotificationOrchestratorResponseDto {
  constructor(public readonly sended: boolean = true) {}
}
