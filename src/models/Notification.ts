import mongoose, { Schema, Document } from "mongoose";

export interface NotificationDocument extends Document {
  recipientId: mongoose.Types.ObjectId;
  recipientType: "driver" | "customer" | "admin";
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    recipientId: { type: Schema.Types.ObjectId, required: true },
    recipientType: {
      type: String,
      enum: ["driver", "customer", "admin"],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.Notification ||
  mongoose.model<NotificationDocument>("Notification", NotificationSchema);
