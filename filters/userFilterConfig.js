// server/filters/userFilterConfig.js

export const USER_FILTER_FIELDS = {
  firstName: {
    path: "firstName",
    type: "string",
  },
  lastName: {
    path: "lastName",
    type: "string",
  },
  email: {
    path: "email",
    type: "string",
  },
  phone: {
    path: "phone",
    type: "string",
  },
  city: {
    path: "city",
    type: "string",
  },
  brands: {
    path: "brands",
    type: "array",
  },
  smsEnabled: {
    path: "promoChannels.sms.enabled",
    type: "boolean",
  },
  emailEnabled: {
    path: "promoChannels.email.enabled",
    type: "boolean",
  },
  createdAt: {
    path: "createdAt",
    type: "date",
  },
};
