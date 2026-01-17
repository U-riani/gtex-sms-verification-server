// server/models/SmsCampaign.js
import mongoose from "mongoose";

const SmsCampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    channel: {
      type: String,
      enum: ["sms", "whatsapp", "email"],
      required: true,
      index: true,
    },

    brand: {
      type: String,
      required: true,
      index: true,
    },

    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SmsTemplate",
      required: true,
    },

    segmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Segment",
      required: true,
    },

    // snapshot for safety
    templateSnapshot: {
      name: String,
      content: String,
    },

    segmentSnapshot: {
      name: String,
      userCount: Number,
    },

    stats: {
      total: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ["draft", "running", "completed", "failed"],
      default: "draft",
      index: true,
    },

    startedAt: Date,
    finishedAt: Date,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

SmsCampaignSchema.index({ createdAt: -1 });

export default mongoose.model("SmsCampaign", SmsCampaignSchema);
