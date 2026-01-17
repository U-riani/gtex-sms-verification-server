// server/services/messageDispatcher.js
import { sendSms } from "./senders/smsSender.js";
import { sendEmail } from "./senders/emailSender.js";
import { sendWhatsApp } from "./senders/whatsappSender.js";

export async function dispatchMessage({
  channel,
  providerConfig,
  user,
  message,
}) {
  switch (channel) {
    case "sms":
      return sendSms(providerConfig, user, message);

    case "email":
      return sendEmail(providerConfig, user, message);

    case "whatsapp":
      return sendWhatsApp(providerConfig, user, message);

    default:
      return {
        success: false,
        error: `Unsupported channel: ${channel}`,
      };
  }
}
