import { FilterQuery, Model } from "mongoose";
import { TemplateEntity } from "../../domain/entities/template.entity";
import { MongoTemplateInterface } from "../entities/template.interface";
import { TemplateRepository } from "../../domain/repositories/template.repository";
import { ResponseStatus } from "src/core/shared/domain/entities/response-status.model";

export class MongoTemplateRepository implements TemplateRepository {
  private readonly _model: Model<MongoTemplateInterface>;

  constructor(model: Model<MongoTemplateInterface>) {
    this._model = model;
  }

  public async store(template: TemplateEntity): Promise<TemplateEntity> {
    try {
      const record = await this._model.create({
        sender: template?.toPrimitive()?.sender,
        fields: template?.toPrimitive()?.fields,
        subject: template?.toPrimitive()?.subject,
        templateId: template?.toPrimitive()?.templateId,
        description: template?.toPrimitive()?.description,
        identificator: template?.toPrimitive()?.identificator,
      });

      return this._toDomain(record);
    } catch (error) {
      console.log(`[ERROR][INFRA][MONGO TEMPLATE REPO][STORE] ${error}`);
      throw ResponseStatus.InternalServer("Internal server error.");
    }
  }

  public async disable(identificator: string): Promise<boolean> {
    try {
      const wasDisabled = await this._model.findOneAndUpdate(
        {
          identificator: identificator,
        },
        {
          enabled: false,
        },
        {
          new: true,
        },
      );

      return wasDisabled ? true : false;
    } catch (error) {
      console.log(`[ERROR][INFRA][MONGO TEMPLATE REPO][DISABLE] ${error}`);
      return false;
    }
  }

  public async findByDescription(description: string): Promise<TemplateEntity | null> {
    try {
      const record = await this._model.findOne({ description });
      return record ? this._toDomain(record) : null;
    } catch (error) {
      console.log(`[ERROR][MONGO][TEMPLATE][FIND_BY_DESCRIPTION] ${JSON.stringify(error)}`);
      return null;
    }
  }

  public async findByIdentificator(identificator: string): Promise<TemplateEntity | null> {
    try {
      const record = await this._model.findOne({ identificator });
      return record ? this._toDomain(record) : null;
    } catch (error) {
      console.log(`[ERROR][MONGO][TEMPLATE][FIND_BY_IDENTIFICATOR] ${JSON.stringify(error)}`);
      return null;
    }
  }

  public async findPaginated(
    page: number,
    pageSize: number,
    enabled?: boolean,
  ): Promise<{ count: number; records: Array<TemplateEntity> }> {
    try {
      const take = Math.max(1, pageSize);
      const skip = Math.max(0, (page - 1) * take);
      const filter: FilterQuery<MongoTemplateInterface> = {};

      if (enabled) filter.enabled = enabled;

      const [count, records] = await Promise.all([
        this._model.countDocuments(filter),
        this._model.find(filter).select("-templateId").limit(take).skip(skip).exec(),
      ]);

      return { count, records: records?.map((record) => this._toDomain(record)) || [] };
    } catch (error) {
      console.log(`[ERROR][MONGO][TEMPLATE][FIND_PAGINATED] ${JSON.stringify(error)}`);
      return { count: 0, records: [] };
    }
  }

  private _toDomain(template: MongoTemplateInterface): TemplateEntity {
    return TemplateEntity.create({
      id: template?.id,
      sender: template?.sender,
      fields: template?.fields,
      subject: template?.subject,
      enabled: template?.enabled,
      createdAt: template?.createdAt,
      updatedAt: template?.updatedAt,
      templateId: template?.templateId,
      description: template?.description,
      identificator: template?.identificator,
    });
  }
}
