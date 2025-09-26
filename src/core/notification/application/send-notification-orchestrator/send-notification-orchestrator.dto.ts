export interface SendNotificationOrchestratorDto {
  templateID: string;
  fields: Record<string, unknown>;
  recipients: string | Array<string>;
}
