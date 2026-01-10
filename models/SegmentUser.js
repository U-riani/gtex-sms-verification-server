// models/SegmentUser.js
import mongoose from "mongoose";

const SegmentUserSchema = new mongoose.Schema(
  {
    segmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Segment",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deletedAt: { type: Date, default: null },
    deleteToken: { type: String, default: null },
  },
  { timestamps: true }
);

// prevent duplicates
SegmentUserSchema.index(
  { segmentId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

// auto-cleanup after 5 minutes
SegmentUserSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 300 });

export default mongoose.model("SegmentUser", SegmentUserSchema);
