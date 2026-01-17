import { mainDb } from "@/lib/db/db";
import { admins } from "@/lib/db/schema-main";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password, rememberMe } = await req.json();
    
    const admin = await mainDb.select().from(admins).where(eq(admins.email, email)).get();
    
    if (!admin) {
      return new Response("Invalid credentials", { status: 401 });
    }
    
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
    const storedPassword = admin.password;
    
    if (!storedPassword || storedPassword !== passwordHash) {
      return new Response("Invalid credentials", { status: 401 });
    }
    
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const cookieStore = await cookies();
    
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 1 day
    
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge,
      path: "/",
    });
    
    cookieStore.set("admin_id", admin.id, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge,
      path: "/",
    });
    
    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin login error:", error);
    return new Response("Server error", { status: 500 });
  }
}
