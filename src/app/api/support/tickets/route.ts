import { NextResponse } from "next/server";
import { mainDb } from "@/lib/db/db";
import { supportTickets, ticketMessages, companies } from "@/lib/db/schema-main";
import { desc, eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const tickets = await mainDb
      .select()
      .from(supportTickets)
      .orderBy(desc(supportTickets.updatedAt))
      .all();

    const ticketsWithMessages = await Promise.all(
      tickets.map(async (ticket) => {
        const messages = await mainDb
          .select()
          .from(ticketMessages)
          .where(eq(ticketMessages.ticketId, ticket.id))
          .orderBy(ticketMessages.createdAt)
          .all();

        let company = null;
        if (ticket.companyId) {
          company = await mainDb
            .select()
            .from(companies)
            .where(eq(companies.id, ticket.companyId))
            .get();
        }

        return { ...ticket, messages, company };
      })
    );

    return NextResponse.json({ tickets: ticketsWithMessages });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "فشل في جلب التذاكر" },
      { status: 500 }
    );
  }
}
