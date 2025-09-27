import {
  SendNotificationOrchestratorDto,
  SendNotificationOrchestratorResponseDto,
} from "./send-email-orchestrator.dto";
import { SmtpProvider } from "../../domain/providers/smtp.provider";
import { StoreNotificationLogUseCase } from "../store-notification-log";
import { UploadProvider } from "src/core/template/domain/providers/upload.provider";
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

  public async execute(
    dto: SendNotificationOrchestratorDto,
  ): Promise<SendNotificationOrchestratorResponseDto> {
    const template = await this._templateRepository.findByIdentificator(dto.templateID);
    if (!template) throw new TemplateNotFoundException(dto.templateID);

    let notificationStatus = NOTIFICATION_STATE_ENUM.PENDING;

    const { enabled, templateId, fields, sender, subject } = template.toPrimitive();
    if (!enabled) throw new TemplateAlreadyDisabledException();

    const contentResult = await this._uploadProvider.getContentById(templateId);
    if (!contentResult.success || !contentResult.content) {
      await this._storeNotificationLog({
        response: "",
        templateID: dto.templateID,
        recipients: dto.recipients,
        responseException: contentResult.error,
        status: NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE,
      });

      return new SendNotificationOrchestratorResponseDto(false);
    }

    if (!this._areValidFields(fields, dto.fields)) throw new FieldsNotValidException();

    const processingResult = ContentFieldReplacerMapper.replace(contentResult.content, dto.fields);
    if (!processingResult.success || !processingResult.content) {
      await this._storeNotificationLog({
        response: "",
        templateID: dto.templateID,
        recipients: dto.recipients,
        responseException: `[CORE] Template processing failed: ${processingResult.error}`,
        status: NOTIFICATION_STATE_ENUM.CORE_FAILURE,
      });

      return new SendNotificationOrchestratorResponseDto(false);
    }

    const { status, response, responseException } = await this._smtpProvider.SendEmailWithTemplate(
      sender,
      subject,
      dto.recipients,
      processingResult.content,
    );

    notificationStatus = status;

    await this._storeNotificationLog({
      response: response,
      templateID: dto.templateID,
      status: notificationStatus,
      recipients: dto.recipients,
      responseException: responseException,
    });

    return new SendNotificationOrchestratorResponseDto(
      notificationStatus === NOTIFICATION_STATE_ENUM.SENT,
    );
  }

  private _areValidFields(fields: Array<string>, dtoFields: Record<string, unknown>): boolean {
    return fields.every((field) => dtoFields[field] !== undefined && dtoFields[field] !== null);
  }

  private _storeNotificationLog(dto: StoreNotificationLogDto): Promise<void> {
    return this._storeNotificationLogUseCase.execute(dto);
  }
}
