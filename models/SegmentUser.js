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
  },
  { timestamps: true }
);

SegmentUserSchema.index({ segmentId: 1, userId: 1 }, { unique: true });

export default mongoose.model("SegmentUser", SegmentUserSchema);
