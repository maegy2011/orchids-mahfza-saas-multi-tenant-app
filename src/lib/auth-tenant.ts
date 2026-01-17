import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getTenantDb } from "./db/db";
import * as schema from "./db/schema-tenant";

export const getAuthTenant = (tenantId: string) => {
  const db = getTenantDb(tenantId);
  return betterAuth({
    basePath: `/api/auth/tenant/${tenantId}`,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
    },
    advanced: {
      cookiePrefix: `mahfza_tenant_${tenantId}`,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "employee",
        },
      },
    },
  });
};
