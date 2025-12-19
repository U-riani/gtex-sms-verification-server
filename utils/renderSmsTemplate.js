import { SMS_VARIABLES } from "../config/smsTemplateVariables.js";

export function renderSmsTemplate(template, user, brandLabel) {
  let message = template;

  for (const [key, resolver] of Object.entries(SMS_VARIABLES)) {
    const value = resolver(user, brandLabel);
    const regex = new RegExp(`\\{${key}\\}`, "gi");
    message = message.replace(regex, value);
  }

  return message;
}
