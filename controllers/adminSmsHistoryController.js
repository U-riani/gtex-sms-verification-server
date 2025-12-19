// server/controllers/adminSmsHistoryController.js
import SmsHistory from "../models/SmsHistory.js";

export const getSmsHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.phone) filter.phone = new RegExp(req.query.phone, "i");
    if (req.query.campaignId) filter.campaignId = req.query.campaignId;

    const [items, total] = await Promise.all([
      SmsHistory.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName"),
      SmsHistory.countDocuments(filter),
    ]);

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      items,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch SMS history" });
  }
};
