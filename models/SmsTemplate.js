// server/models/SmsTemplate.js
import mongoose from "mongoose";

const smsTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    brand: { type: String, required: true }, 

    content: { type: String, required: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

export default mongoose.model("SmsTemplate", smsTemplateSchema);
