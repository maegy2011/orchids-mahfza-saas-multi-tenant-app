import { NextRequest, NextResponse } from "next/server";
import { mainDb } from "@/lib/db/db";
import { supportTickets } from "@/lib/db/schema-main";
import { eq } from "drizzle-orm";
import { sendMessage } from "@/lib/telegram/bot";
import { getAdminSession } from "@/lib/admin-auth";

export async function PATCH(
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
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "الحالة مطلوبة" }, { status: 400 });
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
      .update(supportTickets)
      .set({ status, updatedAt: new Date() })
      .where(eq(supportTickets.id, ticketId));

    if (status === "closed") {
      await sendMessage(
        ticket.telegramChatId,
        `✅ <b>تم إغلاق تذكرتك</b> #${ticketId.slice(0, 8)}

شكراً لتواصلك معنا. إذا كان لديك أي استفسار آخر، لا تتردد في التواصل معنا مجدداً.`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return NextResponse.json(
      { error: "فشل في تحديث حالة التذكرة" },
      { status: 500 }
    );
  }
}
