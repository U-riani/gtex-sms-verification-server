export const SMS_VARIABLES = {
  firstName: (u) => u.firstName || "",
  lastName: (u) => u.lastName || "",
  brand: (_u, brandLabel) => brandLabel,
};
