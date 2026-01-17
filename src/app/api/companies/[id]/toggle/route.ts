import { NextRequest, NextResponse } from "next/server";
import { mainDb } from "@/lib/db/db";
import { companies } from "@/lib/db/schema-main";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id: companyId } = await params;

    const company = await mainDb
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .get();

    if (!company) {
      return NextResponse.json({ error: "الشركة غير موجودة" }, { status: 404 });
    }

    await mainDb
      .update(companies)
      .set({ isActive: !company.isActive })
      .where(eq(companies.id, companyId));

    return NextResponse.json({ 
      success: true, 
      isActive: !company.isActive 
    });
  } catch (error) {
    console.error("Error toggling company status:", error);
    return NextResponse.json(
      { error: "فشل في تغيير حالة الشركة" },
      { status: 500 }
    );
  }
}
