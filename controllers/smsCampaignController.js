// server/controllers/smsCampaignController.js
import SmsCampaign from "../models/SmsCampaign.js";
import SmsTemplate from "../models/SmsTemplate.js";
import Segment from "../models/Segment.js";
import SegmentUser from "../models/SegmentUser.js";
import SmsHistory from "../models/SmsHistory.js";
// import { SMS } from "@gosmsge/gosmsge-node";
import { dispatchMessage } from "../services/messageDispatcher.js";

// const sms = new SMS(process.env.GOSMS_API_KEY);

export const startSmsCampaign = async (req, res) => {
  const { templateId, segmentId } = req.body;

  const template = await SmsTemplate.findById(templateId);
  const segment = await Segment.findById(segmentId);

  if (!template || !segment) {
    return res.status(400).json({ error: "Invalid template or segment" });
  }

  const segmentUsers = await SegmentUser.find({
    segmentId,
    deletedAt: null,
  }).populate("userId");

  const campaign = await SmsCampaign.create({
    name: `${template.name} – ${segment.name}`,
    channel: "sms",
    brand: template.brand,
    templateId,
    segmentId,
    templateSnapshot: {
      name: template.name,
      content: template.content,
    },
    segmentSnapshot: {
      name: segment.name,
      userCount: segmentUsers.length,
    },
    stats: {
      total: segmentUsers.length,
      sent: 0,
      failed: 0,
    },
    status: "running",
    startedAt: new Date(),
    createdBy: req.admin?._id,
  });

  for (const su of segmentUsers) {
    const user = su.userId;
    if (!user?.phone?.full) {
      campaign.stats.failed += 1;
      continue;
    }

    const finalMessage = template.content
      .replace("{firstName}", user.firstName ?? "")
      .replace("{lastName}", user.lastName ?? "")
      .replace("{brand}", template.brand);

    const result = await dispatchMessage({
      channel: "sms",
      providerConfig: {
        apiKey: process.env.GOSMS_API_KEY,
        sender: "UniStep",
      },
      user,
      message: finalMessage,
    });

    await SmsHistory.create({
      campaignId: campaign._id,
      brand: template.brand,
      userId: user._id,
      phone: user.phone.full,
      templateMessage: template.content,
      finalMessage,
      channel: "sms",
      status: result.success ? "sent" : "failed",
      error: result.error,
    });

    if (result.success) campaign.stats.sent += 1;
    else campaign.stats.failed += 1;
  }

  campaign.status =
    campaign.stats.failed === campaign.stats.total ? "failed" : "completed";

  campaign.finishedAt = new Date();
  await campaign.save();

  res.json({
    success: true,
    campaignId: campaign._id,
    stats: campaign.stats,
  });
};

export const listCampaigns = async (req, res) => {
  const campaigns = await SmsCampaign.find().sort({ createdAt: -1 }).limit(50);

  res.json({ campaigns });
};

export const getCampaignDetails = async (req, res) => {
  const { id } = req.params;

  const campaign = await SmsCampaign.findById(id)
    .populate("templateId")
    .populate("segmentId");

  const history = await SmsHistory.find({ campaignId: id })
    .populate("userId")
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({ campaign, history });
};
