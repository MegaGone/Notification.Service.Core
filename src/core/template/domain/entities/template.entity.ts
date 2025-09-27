import { PrimitiveTemplate } from "./template.interface";

export class TemplateEntity {
  constructor(private readonly _attributes: PrimitiveTemplate) {}

  public static create(attributes: PrimitiveTemplate): TemplateEntity {
    return new TemplateEntity({
      id: attributes?.id,
      type: attributes?.type,
      sender: attributes?.sender,
      fields: attributes?.fields,
      subject: attributes?.subject,
      enabled: attributes?.enabled,
      createdAt: attributes?.createdAt,
      updatedAt: attributes?.updatedAt,
      templateId: attributes?.templateId,
      description: attributes?.description,
      identificator: attributes?.identificator,
    });
  }

  public toPrimitive(): PrimitiveTemplate {
    return {
      id: this._attributes?.id,
      type: this._attributes?.type,
      sender: this._attributes?.sender,
      fields: this._attributes?.fields,
      enabled: this._attributes.enabled,
      subject: this._attributes?.subject,
      createdAt: this._attributes?.createdAt,
      updatedAt: this._attributes?.updatedAt,
      templateId: this._attributes?.templateId,
      description: this._attributes?.description,
      identificator: this._attributes?.identificator,
    };
  }
}
