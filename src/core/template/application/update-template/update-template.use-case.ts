import { UploadProvider } from "../../domain/providers/upload.provider";
import { PrimitiveTemplate } from "../../domain/entities/template.interface";
import { TemplateRepository } from "../../domain/repositories/template.repository";
import { UpdateTemplateDto, UpdateTemplateResponseDto } from "./update-template.dto";
import { UploadFileException } from "../../domain/exceptions/template-uploaded.exception";
import { TemplateNotFoundException } from "../../domain/exceptions/template-not-found.exception";
import { TemplateDuplicatedException } from "../../domain/exceptions/template-duplicated.exception";
import { TemplateAlreadyDisabledException } from "../../domain/exceptions/template-disabled.exception";

export class UpdateTemplateUseCase {
  constructor(
    private readonly _uploadService: UploadProvider,
    private readonly _templateRepository: TemplateRepository,
  ) {}

  public async execute(dto: UpdateTemplateDto): Promise<UpdateTemplateResponseDto> {
    const record = await this._templateRepository.findByIdentificator(dto.identificator);
    if (!record) throw new TemplateNotFoundException(dto.identificator);

    const primitiveTemplate = record.toPrimitive();
    if (!primitiveTemplate.enabled) throw new TemplateAlreadyDisabledException();

    await this._validateDescriptionUniqueness(dto, primitiveTemplate);

    const wasUpdated = await this._updateTemplate(dto, primitiveTemplate);

    return { updated: wasUpdated };
  }

  private async _validateDescriptionUniqueness(
    dto: UpdateTemplateDto,
    currentTemplate: PrimitiveTemplate,
  ): Promise<void> {
    const isSameDescription = !dto.description || dto.description === currentTemplate.description;
    if (isSameDescription) return;

    const duplicated = await this._templateRepository.findByDescription(dto.description);
    const isDifferentTemplate = duplicated?.toPrimitive().identificator !== dto.identificator;

    if (duplicated && isDifferentTemplate) throw new TemplateDuplicatedException();
  }

  private async _updateTemplate(
    dto: UpdateTemplateDto,
    currentTemplate: PrimitiveTemplate,
  ): Promise<boolean> {
    const { newTemplateId, oldFileToDelete } = await this._handleFileUpdate(dto, currentTemplate);

    const updateData: Partial<PrimitiveTemplate> = {
      ...(dto.fields && { fields: dto.fields }),
      ...(dto.sender && { sender: dto.sender }),
      ...(dto.subject && { subject: dto.subject }),
      ...(newTemplateId && { templateId: newTemplateId }),
      ...(dto.description && { description: dto.description }),
    };

    return this._executeUpdate(dto.identificator, updateData, { newTemplateId, oldFileToDelete });
  }

  private async _handleFileUpdate(
    dto: UpdateTemplateDto,
    currentTemplate: PrimitiveTemplate,
  ): Promise<{ newTemplateId?: string; oldFileToDelete?: string }> {
    if (!dto.filename) return {};

    const { success, publicId } = await this._uploadService.upload(dto.filename);
    if (!success || !publicId) throw new UploadFileException();

    return {
      newTemplateId: publicId,
      oldFileToDelete: currentTemplate.templateId,
    };
  }

  private async _executeUpdate(
    identificator: string,
    updateData: Partial<PrimitiveTemplate>,
    fileUpdate: { newTemplateId?: string; oldFileToDelete?: string },
  ): Promise<boolean> {
    try {
      const wasUpdated = await this._templateRepository.update(identificator, updateData);

      return this._handleUpdateResult(wasUpdated, fileUpdate);
    } catch (error) {
      await this._rollbackFileUpdate(fileUpdate.newTemplateId);
      return false;
    }
  }

  private async _handleUpdateResult(
    wasUpdated: boolean,
    fileUpdate: { newTemplateId?: string; oldFileToDelete?: string },
  ): Promise<boolean> {
    if (!wasUpdated) {
      await this._rollbackFileUpdate(fileUpdate.newTemplateId);
      return false;
    }

    await this._cleanupOldFile(fileUpdate.oldFileToDelete);
    return true;
  }

  private async _rollbackFileUpdate(newTemplateId?: string): Promise<void> {
    if (!newTemplateId) return;
    await this._safeDeleteFile(newTemplateId);
  }

  private async _cleanupOldFile(oldFileId?: string): Promise<void> {
    if (!oldFileId) return;
    await this._safeDeleteFile(oldFileId);
  }

  private async _safeDeleteFile(fileId: string): Promise<void> {
    try {
      await this._uploadService.deleteById(fileId);
    } catch (error) {
      console.warn(`Failed to delete file ${fileId}:`, error);
    }
  }
}
