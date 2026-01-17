import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  const adminId = cookieStore.get("admin_id");
  
  if (!session || !adminId) {
    return null;
  }
  
  return { adminId: adminId.value };
}

export async function requireAdmin() {
  const session = await getAdminSession();
  
  if (!session) {
    redirect("/admin/login");
  }
  
  return session;
}
