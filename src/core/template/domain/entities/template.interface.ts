import { TEMPLATE_TYPE_ENUM } from "../constants";

export interface PrimitiveTemplate {
  id?: string;
  sender: string;
  subject: string;
  createdAt?: Date;
  updatedAt?: Date;
  enabled?: boolean;
  templateId: string;
  description: string;
  fields: Array<string>;
  identificator?: string;
  type: TEMPLATE_TYPE_ENUM;
}
