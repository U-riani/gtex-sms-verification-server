// server/controllers/adminSmsRetryController.js
import SmsHistory from "../models/SmsHistory.js";
import { SMS } from "@gosmsge/gosmsge-node";
import { SMS_BRANDS } from "../config/smsBrands.js";

export const retryFailedSms = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No SMS selected" });
    }

    const failedMessages = await SmsHistory.find({
      _id: { $in: ids },
      status: "failed",
    });

    let retried = 0;
    let failed = 0;

    for (const smsItem of failedMessages) {
      const brandCfg = SMS_BRANDS[smsItem.brand];
      if (!brandCfg) {
        failed++;
        continue;
      }

      const sms = new SMS(brandCfg.apiKey);

      try {
        await sms.send(
          smsItem.phone,
          smsItem.finalMessage,
          brandCfg.sender
        );

        smsItem.status = "sent";
        smsItem.error = null;
        await smsItem.save();

        retried++;
      } catch (err) {
        smsItem.error = err.message;
        await smsItem.save();
        failed++;
      }
    }

    res.json({
      success: true,
      retried,
      failed,
    });
  } catch (err) {
    console.error("Retry SMS error:", err);
    res.status(500).json({ error: "Retry failed" });
  }
};
