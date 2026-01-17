import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { mainDb } from "./db/db";
import * as schema from "./db/schema-main";

export const authAdmin = betterAuth({
  database: drizzleAdapter(mainDb, {
    provider: "sqlite",
    schema: {
      user: schema.admins, // Mapping central admins to better-auth user concept
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    cookiePrefix: "mahfza_admin",
  },
});
