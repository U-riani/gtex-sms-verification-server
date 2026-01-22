import User from "../models/User.js";
import SmsTemplate from "../models/SmsTemplate.js";
import Segment from "../models/Segment.js";
import SmsCampaign from "../models/SmsCampaign.js";
import SmsHistory from "../models/SmsHistory.js";

export const dashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    /* ---------------------------
     * OVERALL TOTALS
     * --------------------------- */
    const [
      totalUsers,
      totalSegments,
      totalTemplates,
      totalCampaigns,
      totalSmsSuccess,
      totalSmsFailed,
    ] = await Promise.all([
      User.countDocuments(),
      Segment.countDocuments(),
      SmsTemplate.countDocuments(),
      SmsCampaign.countDocuments(),
      SmsHistory.countDocuments({ status: "sent" }),
      SmsHistory.countDocuments({ status: "failed" }),
    ]);

    /* ---------------------------
     * LAST 7 DAYS TOTALS
     * --------------------------- */
    const [
      weeklyUsers,
      weeklySegments,
      weeklyTemplates,
      weeklyCampaigns,
      weeklySmsSuccess,
      weeklySmsFailed,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      Segment.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      SmsTemplate.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      SmsCampaign.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      SmsHistory.countDocuments({
        status: "sent",
        createdAt: { $gte: oneWeekAgo },
      }),
      SmsHistory.countDocuments({
        status: "failed",
        createdAt: { $gte: oneWeekAgo },
      }),
    ]);

    return res.json({
      overall: {
        users: totalUsers,
        segments: totalSegments,
        templates: totalTemplates,
        campaigns: totalCampaigns,
        sms: {
          success: totalSmsSuccess,
          failed: totalSmsFailed,
        },
      },
      lastWeek: {
        users: weeklyUsers,
        segments: weeklySegments,
        templates: weeklyTemplates,
        campaigns: weeklyCampaigns,
        sms: {
          success: weeklySmsSuccess,
          failed: weeklySmsFailed,
        },
      },
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return res.status(500).json({
      message: "Failed to load dashboard statistics",
    });
  }
};
