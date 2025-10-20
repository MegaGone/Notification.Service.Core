import { TEMPLATE_TYPE_ENUM } from "../../domain/constants";

export interface StoreTemplateDto {
  sender: string;
  subject: string;
  filename: string;
  description: string;
  fields: Array<string>;
  type: TEMPLATE_TYPE_ENUM;
}

export interface StoreTemplateResponseDto {
  id: string;
  stored: boolean;
}
