// server/models/SmsHistory.js
import mongoose from "mongoose";

const SmsHistorySchema = new mongoose.Schema(
  {
    campaignId: {
      type: String,
      index: true,
    },

    brand: {
      type: String,
      index: true,
    },

    brandLabel: String,
    sender: String,

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    phone: String,

    templateMessage: String,
    finalMessage: String,

    status: {
      type: String,
      enum: ["sent", "failed"],
      index: true,
    },
    channel: {
      type: String,
      enum: ["sms", "whatsapp", "email"],
      required: true,
      index: true,
    },

    error: String,
  },
  { timestamps: true }
);

// 🔥 index createdAt properly (without redefining it)
SmsHistorySchema.index({ createdAt: -1 });

export default mongoose.model("SmsHistory", SmsHistorySchema);
