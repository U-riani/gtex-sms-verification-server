// server/controllers/adminSmsCampaignController.js
import SmsHistory from "../models/SmsHistory.js";

export const getSmsCampaigns = async (req, res) => {
  const campaigns = await SmsHistory.aggregate([
    {
      $group: {
        _id: "$campaignId",
        brand: { $first: "$brand" },
        sender: { $first: "$sender" },
        total: { $sum: 1 },
        sent: {
          $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] },
        },
        failed: {
          $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
        },
        createdAt: { $min: "$createdAt" },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  res.json({ campaigns });
};
