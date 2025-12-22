import { SMS } from "@gosmsge/gosmsge-node";

export async function sendSms(cfg, user, message) {
  const sms = new SMS(cfg.apiKey);
  return sms.send(user.phone, message, cfg.sender);
}
