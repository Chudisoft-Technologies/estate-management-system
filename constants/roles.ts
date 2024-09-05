// src/constants/roles.ts
export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  TENANT: "TENANT",
  GUEST: "GUEST",
  STAFF: "STAFF",
  CASHIER: "CASHIER",
  USER: "USER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
