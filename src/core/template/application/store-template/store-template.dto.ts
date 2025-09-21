export interface StoreTemplateDto {
  sender: string;
  subject: string;
  filename: string;
  description: string;
  fields: Array<string>;
}

export interface StoreTemplateResponseDto {
  id: string;
  stored: boolean;
}
