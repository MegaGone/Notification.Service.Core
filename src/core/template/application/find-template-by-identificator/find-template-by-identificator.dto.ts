import { PrimitiveTemplate } from "../../domain/entities/template.interface";

export interface FindTemplateByIdentificatorDto {
  identificator: string;
}

export interface FindTemplateByIdentificatorResponseDto {
  template: PrimitiveTemplate;
}
