// controllers/segmentController.js
import mongoose from "mongoose";
import SegmentUser from "../models/SegmentUser.js";
import Segment from "../models/Segment.js";
import crypto from "crypto";

const mapUserForTable = (u) => {
  if (!u) return null;

  return {
    ...u,
    phone: u.phone?.full || "",
  };
};

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
    await SegmentUser.updateMany(
      {
        segmentId: segment._id,
        userId: { $in: validIds },
        deletedAt: { $ne: null },
      },
      {
        $set: { deletedAt: null },
        $unset: { deleteToken: "" },
      },
    );

    const rows = validIds.map((uid) => ({
      segmentId: segment._id,
      userId: uid,
    }));

    await SegmentUser.insertMany(rows, { ordered: false });
  }

  res.json(segment);
};

export const listSegments = async (req, res) => {
  const segments = await Segment.aggregate([ {
      $sort: { createdAt: -1 }, // 🔥 newest first
    },
    {
      $lookup: {
        from: "segmentusers",
        let: { sid: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$segmentId", "$$sid"] },
                  {
                    $or: [
                      { $eq: ["$deletedAt", null] },
                      { $not: ["$deletedAt"] },
                    ],
                  },
                ],
              },
            },
          },
        ],
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

export const getSegmentById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid segment id" });
  }

  const result = await Segment.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        from: "segmentusers",
        let: { sid: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$segmentId", "$$sid"] },
                  {
                    $or: [
                      { $eq: ["$deletedAt", null] },
                      { $not: ["$deletedAt"] },
                    ],
                  },
                ],
              },
            },
          },
        ],
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

  if (!result.length) {
    return res.status(404).json({ message: "Segment not found" });
  }

  res.json({
    segment: result[0],
  });
};

export const getSegmentUsers = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const query = {
    segmentId: id,
    deletedAt: null,
  };

  const [rows, total] = await Promise.all([
    SegmentUser.find(query)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("userId")
      .lean(), // KEEP lean
    SegmentUser.countDocuments(query),
  ]);

  const users = rows.map((r) => mapUserForTable(r.userId)).filter(Boolean);

  res.json({
    users,
    total,
    page: Number(page),
    limit: Number(limit),
  });
};

export const removeUserFromSegment = async (req, res) => {
  const deleteToken = crypto.randomUUID();

  await SegmentUser.updateOne(
    {
      segmentId: req.params.segmentId,
      userId: req.params.userId,
      deletedAt: null,
    },
    {
      $set: {
        deletedAt: new Date(),
        deleteToken,
      },
    },
  );

  res.json({
    pending: true,
    deleteToken,
    undoUntil: Date.now() + 5 * 60 * 1000,
  });
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

  const validIds = userIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (!validIds.length) {
    return res.json({ added: 0 });
  }

  await SegmentUser.updateMany(
    {
      segmentId: id,
      userId: { $in: validIds },
      deletedAt: { $ne: null },
    },
    {
      $set: { deletedAt: null },
      $unset: { deleteToken: "" },
    },
  );

  const rows = validIds.map((uid) => ({
    segmentId: id,
    userId: uid,
  }));

  const result = await SegmentUser.insertMany(rows, { ordered: false }).catch(
    () => [],
  );

  res.json({
    added: result.length,
  });
};

export const undoRemoveUserFromSegment = async (req, res) => {
  const { deleteToken } = req.body;

  const result = await SegmentUser.updateOne(
    { deleteToken },
    {
      $set: { deletedAt: null },
      $unset: { deleteToken: "" },
    },
  );

  res.json({
    restored: result.modifiedCount === 1,
  });
};
