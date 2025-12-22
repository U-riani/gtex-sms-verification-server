// server/controllers/adminSmsHistoryController.js
// server/controllers/adminSmsHistoryController.js
import SmsHistory from "../models/SmsHistory.js";

export const getSmsHistory = async (req, res) => {
  try {
    const {
      brand,
      status,
      campaignId,
      from,
      to,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (brand) query.brand = brand;
    if (status) query.status = status;
    if (campaignId) query.campaignId = campaignId;

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      SmsHistory.find(query)
        .populate("userId", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      SmsHistory.countDocuments(query),
    ]);

    res.json({
      items,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error("SMS history error:", err);
    res.status(500).json({ error: "Failed to load SMS history" });
  }
};


export const exportSmsHistoryCsv = async (req, res) => {
  try {
    const items = await SmsHistory.find(req.query)
      .populate("userId", "firstName lastName")
      .sort({ createdAt: -1 });

    const rows = [
      [
        "Date",
        "Brand",
        "User",
        "Phone",
        "Message",
        "Status",
        "Error",
      ],
    ];

    items.forEach((i) => {
      rows.push([
        i.createdAt.toISOString(),
        i.brandLabel,
        i.userId
          ? `${i.userId.firstName || ""} ${i.userId.lastName || ""}`.trim()
          : "",
        i.phone,
        `"${(i.finalMessage || "").replace(/"/g, '""')}"`,
        i.status,
        i.error || "",
      ]);
    });

    const csv = rows.map((r) => r.join(",")).join("\n");

    res.header("Content-Type", "text/csv");
    res.header(
      "Content-Disposition",
      "attachment; filename=sms-history.csv"
    );
    res.send(csv);
  } catch (err) {
    console.error("CSV export error:", err);
    res.status(500).json({ error: "Failed to export CSV" });
  }
};
