// controllers/adminUserAdvancedController.js
import User from "../models/User.js";
import { compileAdvancedFilter } from "../filters/compileUserFilters.js";
const ALLOWED_LIMITS = [20, 50, 100, 1000, 5000, 10000];

export const advancedUserSearch = async (req, res) => {
  try {
    const { filter, page = 1, limit = 20 } = req.body;

    const mongoFilter = compileAdvancedFilter(filter);

    const safeLimit = ALLOWED_LIMITS.includes(Number(limit))
      ? Number(limit)
      : 20;

    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [users, total] = await Promise.all([
      User.find(mongoFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .select("-__v"),
      User.countDocuments(mongoFilter),
    ]);

    res.json({
      success: true,
      users,
      page: safePage,
      totalPages: Math.ceil(total / safeLimit),
      total,
    });
  } catch (err) {
    console.error("Advanced filter error:", err);
    res.status(500).json({ error: "Advanced filter failed" });
  }
};
