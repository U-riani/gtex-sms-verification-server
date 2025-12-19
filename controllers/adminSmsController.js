import User from "../models/User.js";
import { SMS } from "@gosmsge/gosmsge-node";
import dotenv from "dotenv";
dotenv.config();

const sms = new SMS(process.env.GTEX_API_KEY);

const normalizePhone = (phone) => {
  if (!phone) return null;

  let p = phone.toString().trim();
  p = p.replace(/\s+/g, "");
  p = p.replace(/^\+/, ""); // 🔥 remove leading +

  // Must be 995XXXXXXXX
  if (!p.startsWith("995")) return null;
  if (p.length !== 12) return null;

  return p;
};

export const sendBulkSms = async (req, res) => {
  try {
    const { userIds, message } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "No users selected" });
    }

    if (!message || message.trim().length < 2) {
      return res.status(400).json({ error: "Message is required" });
    }

    const users = await User.find({
      _id: { $in: userIds },
      "promoChannels.sms.enabled": true,
      phone: { $ne: null },
    }).select("phone");

    if (users.length === 0) {
      return res.status(400).json({ error: "No valid SMS recipients" });
    }

    const results = [];

    for (const u of users) {
      const phone = normalizePhone(u.phone);

      if (!phone) {
        results.push({
          phone: u.phone,
          success: false,
          error: "Invalid phone format",
        });
        continue;
      }

      try {
        console.log("Sending SMS to:", phone);

        const r = await sms.send(phone, message, "GTEX");

        results.push({
          phone,
          success: true,
          reference: r?.reference,
        });
      } catch (err) {
        console.error("SMS error FULL:", err);

        results.push({
          phone,
          success: false,
          error: err.message || "Unknown SMS provider error",
        });
      }
    }

    return res.json({
      success: true,
      sent: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  } catch (err) {
    console.error("Bulk SMS error:", err);
    res.status(500).json({ error: "Failed to send SMS" });
  }
};
