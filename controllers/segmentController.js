// controllers/segmentController.js
import mongoose from "mongoose";
import User from "../models/User.js";
import SegmentUser from "../models/SegmentUser.js";
import Segment from "../models/Segment.js";

export const createSegment = async (req, res) => {
  const { name, userIds = [] } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Segment name required" });
  }

  if (!Array.isArray(userIds)) {
    return res.status(400).json({ message: "userIds must be an array" });
  }

  const validIds = userIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  const segment = await Segment.create({
    name,
    createdBy: req.admin._id,
  });

  if (validIds.length) {
    const rows = validIds.map((uid) => ({
      segmentId: segment._id,
      userId: uid,
    }));

    await SegmentUser.insertMany(rows, { ordered: false });
  }

  res.json(segment);
};

export const listSegments = async (req, res) => {
  const segments = await Segment.aggregate([
    {
      $lookup: {
        from: "segmentusers",
        localField: "_id",
        foreignField: "segmentId",
        as: "users",
      },
    },
    {
      $project: {
        name: 1,
        createdAt: 1,
        count: { $size: "$users" },
      },
    },
  ]);

  res.json(segments);
};

export const getSegmentUsers = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const query = { segmentId: id };

  const [rows, total] = await Promise.all([
    SegmentUser.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("userId")
      .lean(),
    SegmentUser.countDocuments(query),
  ]);

  res.json({
    users: rows.map((r) => r.userId),
    total,
    page: Number(page),
    limit: Number(limit),
  });
};

export const removeUserFromSegment = async (req, res) => {
  await SegmentUser.deleteOne({
    segmentId: req.params.segmentId,
    userId: req.params.userId,
  });

  res.json({ success: true });
};

export const deleteSegment = async (req, res) => {
  await SegmentUser.deleteMany({ segmentId: req.params.id });
  await Segment.findByIdAndDelete(req.params.id);

  res.json({ success: true });
};

export const addUsersToSegment = async (req, res) => {
  const { id } = req.params;
  const { userIds = [] } = req.body;

  if (!Array.isArray(userIds)) {
    return res.status(400).json({ message: "userIds must be array" });
  }

  const validIds = userIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );

  if (!validIds.length) {
    return res.json({ added: 0 });
  }

  const rows = validIds.map((uid) => ({
    segmentId: id,
    userId: uid,
  }));

  const result = await SegmentUser.insertMany(rows, {
    ordered: false,
  }).catch(() => null); // ignore duplicates

  res.json({
    added: result?.length || 0,
  });
};
