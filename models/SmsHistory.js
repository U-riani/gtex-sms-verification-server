// server/models/SmsHistory.js
import mongoose from "mongoose";

const SmsHistorySchema = new mongoose.Schema(
  {
    campaignId: mongoose.Schema.Types.ObjectId,

    brand: String,
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

    error: String,
  },
  { timestamps: true }
);

export default mongoose.model("SmsHistory", SmsHistorySchema);
