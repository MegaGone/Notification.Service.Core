import { model, Schema } from "mongoose";
import { MongoNotificationInterface } from "./notification.interface";

const MongoNotificationSchema = new Schema(
  {
    status: { type: Number, required: true },
    response: { type: String, required: false },
    recipients: { type: String, required: true },
    templateID: {
      type: String,
      required: true,
      ref: "Template",
      refPath: "identificator",
    },
    responseException: { type: String, required: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

MongoNotificationSchema.index({ status: 1 });
MongoNotificationSchema.index({ templateID: 1 });
MongoNotificationSchema.index({ createdAt: -1 });
MongoNotificationSchema.index({ recipients: 1 });

MongoNotificationSchema.methods.toJSON = function () {
  const { __v, _id, ...notification } = this.toObject();
  notification.id = _id;
  return notification;
};

const MongoNotificationEntity = model<MongoNotificationInterface>(
  "Notification",
  MongoNotificationSchema,
);

export { MongoNotificationSchema, MongoNotificationEntity };
