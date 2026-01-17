import { NextRequest, NextResponse } from "next/server";
import { mainDb } from "@/lib/db/db";
import { supportTickets, ticketMessages } from "@/lib/db/schema-main";
import { eq } from "drizzle-orm";
import { sendMessage, formatTicketReply } from "@/lib/telegram/bot";
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
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "الرسالة مطلوبة" }, { status: 400 });
    }

    const ticket = await mainDb
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, ticketId))
      .get();

    if (!ticket) {
      return NextResponse.json({ error: "التذكرة غير موجودة" }, { status: 404 });
    }

    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);

    await mainDb.insert(ticketMessages).values({
      id,
      ticketId,
      senderType: "admin",
      message,
      createdAt: new Date(),
    });

    await mainDb
      .update(supportTickets)
      .set({ status: "in_progress", updatedAt: new Date() })
      .where(eq(supportTickets.id, ticketId));

    await sendMessage(ticket.telegramChatId, formatTicketReply(message, true));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error replying to ticket:", error);
    return NextResponse.json(
      { error: "فشل في إرسال الرد" },
      { status: 500 }
    );
  }
}
