// server/filters/smsHistoryFilterConfig.js
export const SMS_HISTORY_FILTER_FIELDS = {
  brand: {
    path: "brand",
    type: "string",
  },

  status: {
    path: "status",
    type: "string",
  },

  phone: {
    path: "phone",
    type: "string",
  },

  message: {
    path: "finalMessage",
    type: "string",
  },

  error: {
    path: "error",
    type: "string",
  },

  createdAt: {
    path: "createdAt",
    type: "date",
  },

  // populated user fields (important!)
  firstName: {
    path: "userId.firstName",
    type: "string",
  },

  lastName: {
    path: "userId.lastName",
    type: "string",
  },
};
