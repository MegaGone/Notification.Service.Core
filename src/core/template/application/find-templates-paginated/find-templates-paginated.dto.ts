import { PrimitiveTemplate } from "../../domain/entities/template.interface";

export interface FindTemplatesPaginatedDto {
  page: number;
  pageSize: number;
  enabled?: boolean;
}

export interface FindTemplatesPaginatedResponseDto {
  count: number;
  templates: Array<PrimitiveTemplate>;
}
