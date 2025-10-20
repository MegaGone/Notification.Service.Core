export interface UpdateTemplateDto {
  sender: string;
  subject: string;
  filename: string;
  description: string;
  fields: Array<string>;
  identificator: string;
}

export interface UpdateTemplateResponseDto {
  updated: boolean;
}
