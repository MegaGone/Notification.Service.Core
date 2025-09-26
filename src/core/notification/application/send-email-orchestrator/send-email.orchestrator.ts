import { SmtpProvider } from "../../domain/providers/smtp.provider";
import { StoreNotificationLogUseCase } from "../store-notification-log";
import { UploadProvider } from "src/core/template/domain/providers/upload.provider";
import { SendNotificationOrchestratorDto } from "./send-email-orchestrator.dto";
import { NOTIFICATION_STATE_ENUM } from "../../domain/constants/notification-state.enum";
import { FieldsNotValidException } from "../../domain/exceptions/fields-not-valid.exception";
import { TemplateRepository } from "src/core/template/domain/repositories/template.repository";
import { StoreNotificationLogDto } from "../store-notification-log/store-notification-log.dto";
import { ContentFieldReplacerMapper } from "../../domain/mappers/content-field-replacer.mapper";
import { TemplateNotFoundException } from "src/core/template/domain/exceptions/template-not-found.exception";
import { TemplateAlreadyDisabledException } from "src/core/template/domain/exceptions/template-disabled.exception";

export class SendEmailOrchestrator {
  constructor(
    private readonly _smtpProvider: SmtpProvider,
    private readonly _uploadProvider: UploadProvider,
    private readonly _templateRepository: TemplateRepository,
    private readonly _storeNotificationLogUseCase: StoreNotificationLogUseCase,
  ) {}

  public async execute(dto: SendNotificationOrchestratorDto): Promise<void> {
    const template = await this._templateRepository.findByIdentificator(dto.templateID);
    if (!template) throw new TemplateNotFoundException(dto.templateID);

    let notificationStatus = NOTIFICATION_STATE_ENUM.PENDING;

    const { enabled, templateId, fields, sender, subject } = template.toPrimitive();
    if (!enabled) throw new TemplateAlreadyDisabledException();

    const { content, exception } = await this._uploadProvider.getContentById(templateId);
    if (exception || !content) {
      return await this._storeNotificationLog({
        response: "",
        templateID: dto.templateID,
        recipients: dto.recipients,
        responseException: exception,
        status: NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE,
      });
    }

    if (!this._areValidFields(fields, dto.fields)) throw new FieldsNotValidException();

    const processedContent = ContentFieldReplacerMapper.replace(content, dto.fields);
    if (!processedContent) notificationStatus = NOTIFICATION_STATE_ENUM.CORE_FAILURE;

    const { status, response, responseException } = await this._smtpProvider.SendEmailWithTemplate(
      sender,
      subject,
      dto.recipients,
      processedContent,
    );

    notificationStatus = status!;

    await this._storeNotificationLog({
      response: response,
      templateID: dto.templateID,
      status: notificationStatus,
      recipients: dto.recipients,
      responseException: responseException,
    });
  }

  private _areValidFields(fields: Array<string>, dtoFields: Record<string, unknown>): boolean {
    return fields.every((field) => dtoFields[field] !== undefined && dtoFields[field] !== null);
  }

  private _storeNotificationLog(dto: StoreNotificationLogDto): Promise<void> {
    return this._storeNotificationLogUseCase.execute(dto);
  }
}
