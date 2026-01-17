import { authAdmin } from "@/lib/auth-admin";
import { getAuthTenant } from "@/lib/auth-tenant";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");

  if (pathParts[3] === "admin") {
    const handlers = toNextJsHandler(authAdmin);
    return handlers.GET(req);
  }

  if (pathParts[3] === "tenant") {
    const tenantId = pathParts[4];
    if (!tenantId) {
      return new Response("Tenant ID missing", { status: 400 });
    }
    const authTenant = getAuthTenant(tenantId);
    const handlers = toNextJsHandler(authTenant);
    return handlers.GET(req);
  }

  return new Response("Not Found", { status: 404 });
};

export const POST = async (req: NextRequest) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");

  if (pathParts[3] === "admin") {
    const handlers = toNextJsHandler(authAdmin);
    return handlers.POST(req);
  }

  if (pathParts[3] === "tenant") {
    const tenantId = pathParts[4];
    if (!tenantId) {
      return new Response("Tenant ID missing", { status: 400 });
    }
    const authTenant = getAuthTenant(tenantId);
    const handlers = toNextJsHandler(authTenant);
    return handlers.POST(req);
  }

  return new Response("Not Found", { status: 404 });
};
