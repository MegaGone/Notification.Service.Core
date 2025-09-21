import { UploadProvider } from "../../domain/providers/upload.provider";
import { TemplateEntity } from "../../domain/entities/template.entity";
import { StoreTemplateDto, StoreTemplateResponseDto } from "./store-template.dto";
import { TemplateRepository } from "../../domain/repositories/template.repository";
import { UploadFileException } from "../../domain/exceptions/template-uploaded.exception";
import { TemplateDuplicatedException } from "../../domain/exceptions/template-duplicated.exception";

export class StoreTemplateUseCase {
  constructor(
    private readonly _uploadProvider: UploadProvider,
    private readonly _templateRepository: TemplateRepository,
  ) {}

  public async execute(dto: StoreTemplateDto): Promise<StoreTemplateResponseDto> {
    const wasDuplicated = await this._templateRepository.findByDescription(dto.description);
    if (wasDuplicated) throw new TemplateDuplicatedException();

    const templateId = await this._uploadProvider.upload(dto.filename);
    if (!templateId) throw new UploadFileException();

    const template = await this._templateRepository.store(
      TemplateEntity.create({
        ...dto,
        templateId,
      }),
    );

    return {
      stored: !!template?.toPrimitive()?.id,
      id: template?.toPrimitive()?.id || "",
    };
  }
}
