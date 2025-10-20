import {
  FindTemplatesPaginatedDto,
  FindTemplatesPaginatedResponseDto,
} from "./find-templates-paginated.dto";
import { TemplateRepository } from "../../domain/repositories/template.repository";

export class FindTemplatesPaginatedUseCase {
  constructor(private readonly _templateRepository: TemplateRepository) {}

  public async execute(dto: FindTemplatesPaginatedDto): Promise<FindTemplatesPaginatedResponseDto> {
    const { count, records } = await this._templateRepository.findPaginated(
      dto.page,
      dto.pageSize,
      dto?.enabled ?? undefined,
    );

    return { count, templates: records?.map((record) => record?.toPrimitive()) || [] };
  }
}
