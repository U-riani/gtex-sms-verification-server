import SmsHistory from "../models/SmsHistory.js";

export const getTemplateStats = async (req, res) => {
  const stats = await SmsHistory.aggregate([
    {
      $group: {
        _id: "$templateMessage",
        brand: { $first: "$brand" },
        sent: {
          $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] },
        },
        failed: {
          $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.json({ stats });
};
