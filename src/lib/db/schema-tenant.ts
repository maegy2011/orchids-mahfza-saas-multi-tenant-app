import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// --- Better-Auth Tables ---
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  role: text("role").default("employee"), // manager, branch_manager, employee
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// --- Business Tables ---

export const branches = sqliteTable("branches", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  managerId: text("manager_id").references(() => user.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const wallets = sqliteTable("wallets", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  branchId: text("branch_id").references(() => branches.id),
  balance: real("balance").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  walletId: text("wallet_id").notNull().references(() => wallets.id),
  amount: real("amount").notNull(),
  type: text("type").notNull(), // deposit, withdrawal, transfer
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
