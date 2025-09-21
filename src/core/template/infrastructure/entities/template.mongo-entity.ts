import { v4 as uuid } from "uuid";
import { model, Schema } from "mongoose";
import { MongoTemplateInterface } from "./template.interface";

const MongoTemplateSchema: Schema = new Schema(
  {
    sender: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    subject: { type: String, required: true },
    fields: { type: [String], required: true },
    templateId: { type: String, required: true },
    description: { type: String, required: true },
    identificator: { type: String, unique: true, default: uuid, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

MongoTemplateSchema.index({ enabled: 1 });
MongoTemplateSchema.index({ templateId: 1 });
MongoTemplateSchema.index({ createdAt: -1 });
MongoTemplateSchema.index({ description: 1 });

MongoTemplateSchema.methods.toJSON = function () {
  const { __v, _id, ...template } = this.toObject();
  template.id = _id;
  return template;
};

const MongoTemplateEntity = model<MongoTemplateInterface>("Template", MongoTemplateSchema);

export { MongoTemplateSchema, MongoTemplateEntity };
