import { NextRequest, NextResponse } from "next/server";
import { mainDb, getTenantDb } from "@/lib/db/db";
import { companies } from "@/lib/db/schema-main";
import { user } from "@/lib/db/schema-tenant";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const allCompanies = await mainDb.select().from(companies);
    return NextResponse.json({ companies: allCompanies });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "فشل في جلب الشركات" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, managerEmail } = body;

    if (!name || !slug || !managerEmail) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCompany = await mainDb.query.companies.findFirst({
      where: eq(companies.slug, slug),
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: "معرف الشركة (Slug) مستخدم بالفعل" },
        { status: 400 }
      );
    }

    const companyId = uuidv4();

    // 1. Save to main database
    await mainDb.insert(companies).values({
      id: companyId,
      name,
      slug,
      managerEmail,
      dbPath: `tenant_${companyId}.db`,
      createdAt: new Date(),
    });

    // 2. Initialize tenant database (this creates the file and tables via the factory)
    getTenantDb(companyId);

    return NextResponse.json({ success: true, companyId });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "فشل في إنشاء الشركة" },
      { status: 500 }
    );
  }
}

// API to update user role after sign-up
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, userId, role } = body;

    if (!companyId || !userId || !role) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    const tenantDb = getTenantDb(companyId);
    await tenantDb.update(user).set({ role }).where(eq(user.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "فشل في تحديث الدور" },
      { status: 500 }
    );
  }
}
