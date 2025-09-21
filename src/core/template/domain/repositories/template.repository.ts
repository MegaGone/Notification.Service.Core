import { TemplateEntity } from "../entities/template.entity";
import { PrimitiveTemplate } from "../entities/template.interface";

export abstract class TemplateRepository {
  // public abstract update(
  //   identificator: string,
  //   template: Partial<PrimitiveTemplate>,
  // ): Promise<boolean>;
  // public abstract findPaginated(
  //   page: number,
  //   pageSize: number,
  // ): Promise<{ count: number; records: Array<TemplateEntity> }>;
  public abstract disable(identificator: string): Promise<boolean>;
  public abstract store(template: TemplateEntity): Promise<TemplateEntity>;
  public abstract findByDescription(description: string): Promise<TemplateEntity | null>;
  public abstract findByIdentificator(identificator: string): Promise<TemplateEntity | null>;
}
