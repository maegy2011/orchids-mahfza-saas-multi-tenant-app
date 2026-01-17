import { NextRequest, NextResponse } from "next/server";
import { mainDb } from "@/lib/db/db";
import { supportTickets, companies } from "@/lib/db/schema-main";
import { eq } from "drizzle-orm";
import { sendMessage } from "@/lib/telegram/bot";
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

    const { id: ticketId } = await params;
    const body = await req.json();
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json({ error: "معرف الشركة مطلوب" }, { status: 400 });
    }

    const ticket = await mainDb
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, ticketId))
      .get();

    if (!ticket) {
      return NextResponse.json({ error: "التذكرة غير موجودة" }, { status: 404 });
    }

    await mainDb
      .update(companies)
      .set({ isActive: true })
      .where(eq(companies.id, companyId));

    await mainDb
      .update(supportTickets)
      .set({ status: "resolved", updatedAt: new Date() })
      .where(eq(supportTickets.id, ticketId));

    const company = await mainDb
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .get();

    await sendMessage(
      ticket.telegramChatId,
      `🎉 <b>مبروك! تم تفعيل شركتك</b>

🏢 <b>الشركة:</b> ${company?.name}

يمكنك الآن الدخول للوحة التحكم واستخدام جميع الميزات.

نتمنى لك تجربة ممتعة! 🚀`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error activating company:", error);
    return NextResponse.json(
      { error: "فشل في تفعيل الشركة" },
      { status: 500 }
    );
  }
}
