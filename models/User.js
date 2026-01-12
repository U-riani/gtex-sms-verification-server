// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    branch: {
      type: String,
      default: "Web",
    },
    brands: [String],
    gender: String,
    firstName: String,
    lastName: String,
    dateOfBirth: String,
    country: String,
    city: String,
    email: String,
    phone: {
      prefix: {
        type: String, // "+995"
        required: true,
      },
      number: {
        type: String, // "555123456"
        required: true,
      },
      full: {
        type: String, // "995555123456"
        required: true,
        unique: true,
        index: true,
      },
    },
    promoChannels: {
      sms: {
        enabled: { type: Boolean, default: false },
        createdAt: { type: Date, default: null },
        updatedAt: { type: Date, default: null },
      },
      email: {
        enabled: { type: Boolean, default: false },
        createdAt: { type: Date, default: null },
        updatedAt: { type: Date, default: null },
      },
    },
    terms: {
      accepted: {
        type: Boolean,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      language: {
        type: String,
        required: true,
      },
      acceptedAt: {
        type: Date,
        required: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
