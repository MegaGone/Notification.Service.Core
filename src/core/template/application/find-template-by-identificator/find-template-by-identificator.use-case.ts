import {
  FindTemplateByIdentificatorDto,
  FindTemplateByIdentificatorResponseDto,
} from "./find-template-by-identificator.dto";
import { TemplateRepository } from "../../domain/repositories/template.repository";
import { TemplateNotFoundException } from "../../domain/exceptions/template-not-found.exception";

export class FindTemplateByIdentificatorUseCase {
  constructor(private readonly _templateRepository: TemplateRepository) {}

  public async execute(
    dto: FindTemplateByIdentificatorDto,
  ): Promise<FindTemplateByIdentificatorResponseDto> {
    const record = await this._templateRepository.findByIdentificator(dto.identificator);

    if (!record) throw new TemplateNotFoundException(dto.identificator);

    return { template: record?.toPrimitive() };
  }
}
