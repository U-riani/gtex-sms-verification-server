// controllers/adminUserAdvancedController.js
import User from "../models/User.js";
import { compileAdvancedFilter } from "../filters/compileUserFilters.js";

export const advancedUserSearch = async (req, res) => {
  try {
    const { filter, page = 1, limit = 20 } = req.body;

    const mongoFilter = compileAdvancedFilter(filter);

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(mongoFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("-__v"),
      User.countDocuments(mongoFilter),
    ]);

    res.json({
      success: true,
      users,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error("Advanced filter error:", err);
    res.status(500).json({ error: "Advanced filter failed" });
  }
};
