// server/services/sender/smsSender.js

import { SMS } from "@gosmsge/gosmsge-node";

let smsClient = null;

function getSmsClient(apiKey) {
  if (!smsClient) {
    smsClient = new SMS(apiKey);
  }
  return smsClient;
}

export async function sendSms(cfg, user, message) {
  if (!user?.phone?.full) {
    return {
      success: false,
      error: "User has no phone number",
    };
  }

  try {
    const client = getSmsClient(cfg.apiKey);

    const result = await client.send(user.phone.full, message, cfg.sender);

    return {
      success: true,
      providerId: result?.message_id || null,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}
