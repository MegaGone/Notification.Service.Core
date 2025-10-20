import { TEMPLATE_TYPE_RECORD } from "../../domain/constants";
import { UploadProvider } from "../../domain/providers/upload.provider";
import { TemplateEntity } from "../../domain/entities/template.entity";
import { StoreTemplateDto, StoreTemplateResponseDto } from "./store-template.dto";
import { TemplateRepository } from "../../domain/repositories/template.repository";
import { UploadFileException } from "../../domain/exceptions/template-uploaded.exception";
import { TemplateDuplicatedException } from "../../domain/exceptions/template-duplicated.exception";
import { TemplateTypeNotAllowedException } from "../../domain/exceptions/template-type-not-allowed.exception";

export class StoreTemplateUseCase {
  constructor(
    private readonly _uploadProvider: UploadProvider,
    private readonly _templateRepository: TemplateRepository,
  ) {}

  public async execute(dto: StoreTemplateDto): Promise<StoreTemplateResponseDto> {
    if (!TEMPLATE_TYPE_RECORD[dto.type]) throw new TemplateTypeNotAllowedException();

    const wasDuplicated = await this._templateRepository.findByDescription(dto.description);
    if (wasDuplicated) throw new TemplateDuplicatedException();

    const { success, publicId } = await this._uploadProvider.upload(dto.filename);
    if (!success || !publicId) throw new UploadFileException();

    const template = await this._templateRepository.store(
      TemplateEntity.create({
        ...dto,
        templateId: publicId,
      }),
    );

    return {
      stored: !!template?.toPrimitive()?.identificator,
      id: template?.toPrimitive()?.identificator || "",
    };
  }
}
