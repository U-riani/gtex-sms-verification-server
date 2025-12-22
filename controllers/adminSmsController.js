import mongoose from "mongoose";
import User from "../models/User.js";
import { SMS } from "@gosmsge/gosmsge-node";
import { SMS_BRANDS } from "../config/smsBrands.js";
import SmsHistory from "../models/SmsHistory.js";
import { sendEmail } from "../services/senders/emailSender.js";

const normalizePhone = (phone) => {
  if (!phone) return null;
  let p = phone.toString().trim().replace(/\s+/g, "").replace(/^\+/, "");
  if (!p.startsWith("995") || p.length !== 12) return null;
  return p;
};

const applyVariables = (template, user, brandLabel) =>
  template
    .replace(/{firstName}/gi, user.firstName || "")
    .replace(/{lastName}/gi, user.lastName || "")
    .replace(/{brand}/gi, brandLabel || "");

export const sendBulkSms = async (req, res) => {
  try {
    const {
      userIds,
      message,
      brand,
      channels = ["sms"],
    } = req.body;

    if (!SMS_BRANDS[brand]) {
      return res.status(400).json({ error: "Invalid brand selected" });
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "No users selected" });
    }

    if (!message || message.trim().length < 2) {
      return res.status(400).json({ error: "Message is required" });
    }

    const allowedChannels = ["sms", "email", "whatsapp"];
    for (const ch of channels) {
      if (!allowedChannels.includes(ch)) {
        return res.status(400).json({ error: `Invalid channel: ${ch}` });
      }
    }

    const { apiKey, sender, label } = SMS_BRANDS[brand];
    const smsClient = new SMS(apiKey);

    const users = await User.find({
      _id: { $in: userIds },
    }).select("phone email firstName lastName promoChannels");

    const campaignId = new mongoose.Types.ObjectId();
    const createdAt = new Date();

    const results = [];

    for (const user of users) {
      for (const channel of channels) {
        let finalMessage = applyVariables(message, user, label);

        try {
          // 🔐 CONSENT CHECK
          if (
            channel === "sms" &&
            !user.promoChannels?.sms?.enabled
          ) {
            throw new Error("SMS consent not given");
          }

          if (
            channel === "email" &&
            !user.promoChannels?.email?.enabled
          ) {
            throw new Error("Email consent not given");
          }

          // 🚀 SEND
          if (channel === "sms") {
            const phone = normalizePhone(user.phone);
            if (!phone) throw new Error("Invalid phone format");

            await smsClient.send(phone, finalMessage, sender);
          }

          if (channel === "email") {
            await sendEmail(
              { sender, subject: `${label} Notification` },
              user,
              finalMessage
            );
          }

          // 🧾 HISTORY — SENT
          await SmsHistory.create({
            campaignId,
            brand,
            brandLabel: label,
            sender,
            channel,
            userId: user._id,
            phone: channel === "sms" ? user.phone : user.email,
            templateMessage: message,
            finalMessage,
            status: "sent",
            createdAt,
          });

          results.push({ userId: user._id, channel, success: true });
        } catch (err) {
          // 🧾 HISTORY — FAILED
          await SmsHistory.create({
            campaignId,
            brand,
            brandLabel: label,
            sender,
            channel,
            userId: user._id,
            phone: user.phone || user.email,
            templateMessage: message,
            finalMessage,
            status: "failed",
            error: err.message,
            createdAt,
          });

          results.push({
            userId: user._id,
            channel,
            success: false,
            error: err.message,
          });
        }
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
    console.error("Bulk message error:", err);
    res.status(500).json({ error: "Failed to send messages" });
  }
};
