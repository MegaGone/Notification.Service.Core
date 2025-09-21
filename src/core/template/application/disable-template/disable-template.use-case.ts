import { UploadProvider } from "../../domain/providers/upload.provider";
import { TemplateRepository } from "../../domain/repositories/template.repository";
import { DisableTemplateDto, DisableTemplateResponseDto } from "./disable-template.dto";
import { UploadFileException } from "../../domain/exceptions/template-uploaded.exception";
import { TemplateNotFoundException } from "../../domain/exceptions/template-not-found.exception";
import { TemplateAlreadyDisabledException } from "../../domain/exceptions/template-disabled.exception";

export class DisableTemplateUseCase {
  constructor(
    private readonly _uploadProvider: UploadProvider,
    private readonly _templateRepository: TemplateRepository,
  ) {}

  public async execute(dto: DisableTemplateDto): Promise<DisableTemplateResponseDto> {
    const record = await this._templateRepository.findByIdentificator(dto.identificator);
    if (!record) throw new TemplateNotFoundException(dto.identificator);

    const template = record?.toPrimitive();

    if (!template?.enabled) throw new TemplateAlreadyDisabledException();

    const wasDeletedRemoteTemplate = await this._uploadProvider.deleteById(template?.templateId);
    if (!wasDeletedRemoteTemplate) throw new UploadFileException();

    const wasDisabled = await this._templateRepository.disable(template?.templateId);
    return { disabled: wasDisabled };
  }
}
