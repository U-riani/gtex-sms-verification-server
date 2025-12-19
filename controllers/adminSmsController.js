// server/controllers/adminSmsController.js

import mongoose from "mongoose";
import User from "../models/User.js";
import { SMS } from "@gosmsge/gosmsge-node";
import { SMS_BRANDS } from "../config/smsBrands.js";
import SmsHistory from "../models/SmsHistory.js";

const normalizePhone = (phone) => {
  if (!phone) return null;

  let p = phone.toString().trim();
  p = p.replace(/\s+/g, "");
  p = p.replace(/^\+/, "");

  if (!p.startsWith("995")) return null;
  if (p.length !== 12) return null;

  return p;
};

const applyVariables = (template, user, brandLabel) => {
  return template
    .replace(/{firstName}/gi, user.firstName || "")
    .replace(/{lastName}/gi, user.lastName || "")
    .replace(/{brand}/gi, brandLabel || "");
};

export const sendBulkSms = async (req, res) => {
  try {
    const { userIds, message, brand } = req.body;

    if (!SMS_BRANDS[brand]) {
      return res.status(400).json({ error: "Invalid brand selected" });
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "No users selected" });
    }

    if (!message || message.trim().length < 2) {
      return res.status(400).json({ error: "Message is required" });
    }

    const { apiKey, sender, label } = SMS_BRANDS[brand];
    const sms = new SMS(apiKey);

    const users = await User.find({
      _id: { $in: userIds },
      "promoChannels.sms.enabled": true,
      phone: { $ne: null },
    }).select("phone firstName lastName");

    if (users.length === 0) {
      return res.status(400).json({
        error: "No users with SMS enabled and valid phone numbers",
      });
    }

    // 🧠 Campaign grouping (future analytics, retries)
    const campaignId = new mongoose.Types.ObjectId();
    const createdAt = new Date();

    const results = [];

    for (const u of users) {
      const phone = normalizePhone(u.phone);

      if (!phone) {
        await SmsHistory.create({
          campaignId,
          brand,
          brandLabel: label,
          sender,
          userId: u._id,
          phone: u.phone,
          templateMessage: message,
          finalMessage: message,
          status: "failed",
          error: "Invalid phone format",
          createdAt,
        });

        results.push({
          phone: u.phone,
          success: false,
          error: "Invalid phone format",
        });
        continue;
      }

      const finalMessage = applyVariables(message, u, label);

      try {
        await sms.send(phone, finalMessage, sender);

        await SmsHistory.create({
          campaignId,
          brand,
          brandLabel: label,
          sender,
          userId: u._id,
          phone,
          templateMessage: message,
          finalMessage,
          status: "sent",
          createdAt,
        });

        results.push({ phone, success: true });
      } catch (err) {
        await SmsHistory.create({
          campaignId,
          brand,
          brandLabel: label,
          sender,
          userId: u._id,
          phone,
          templateMessage: message,
          finalMessage,
          status: "failed",
          error: err.message,
          createdAt,
        });

        results.push({
          phone,
          success: false,
          error: err.message,
        });
      }
    }

    res.json({
      success: true,
      campaignId,
      sent: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  } catch (err) {
    console.error("Bulk SMS error:", err);
    res.status(500).json({ error: "Failed to send SMS" });
  }
};
