import { NextRequest, NextResponse } from "next/server";
import { mainDb } from "@/lib/db/db";
import { supportTickets, ticketMessages, companies } from "@/lib/db/schema-main";
import { eq, desc } from "drizzle-orm";
import {
  sendMessage,
  notifyAdmins,
  getWelcomeMessage,
  getHelpMessage,
  formatNewTicketNotification,
  formatTicketReply,
  type TelegramUpdate,
} from "@/lib/telegram/bot";

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();

    if (!update.message || !update.message.text) {
      return NextResponse.json({ ok: true });
    }

    const { message } = update;
    const chatId = message.chat.id.toString();
    const text = message.text!.trim();
    const username = message.from.username;

    if (text.startsWith("/start")) {
      const params = text.split(" ")[1];
      
      if (params?.startsWith("activate_")) {
        const companyId = params.replace("activate_", "");
        const company = await mainDb
          .select()
          .from(companies)
          .where(eq(companies.id, companyId))
          .get();

        if (company) {
          const ticketId = generateId();
          const now = new Date();

          await mainDb.insert(supportTickets).values({
            id: ticketId,
            companyId: companyId,
            telegramChatId: chatId,
            telegramUsername: username,
            subject: `طلب تفعيل شركة: ${company.name}`,
            status: "open",
            priority: "high",
            createdAt: now,
            updatedAt: now,
          });

          await mainDb.insert(ticketMessages).values({
            id: generateId(),
            ticketId: ticketId,
            senderType: "customer",
            message: `طلب تفعيل شركة\nاسم الشركة: ${company.name}\nالمعرف: ${company.slug}\nالبريد: ${company.managerEmail}`,
            createdAt: now,
          });

          await sendMessage(
            chatId,
            `✅ <b>تم استلام طلب التفعيل</b>

🏢 <b>الشركة:</b> ${company.name}
🔖 <b>رقم التذكرة:</b> #${ticketId.slice(0, 8)}

سيقوم فريقنا بمراجعة طلبك والرد عليك في أقرب وقت.
يمكنك متابعة حالة طلبك بإرسال /status`
          );

          await notifyAdmins(
            formatNewTicketNotification({
              id: ticketId,
              subject: `طلب تفعيل شركة: ${company.name}`,
              username,
              chatId,
              companyId,
            })
          );

          return NextResponse.json({ ok: true });
        }
      }

      await sendMessage(chatId, getWelcomeMessage());
      return NextResponse.json({ ok: true });
    }

    if (text === "/help") {
      await sendMessage(chatId, getHelpMessage());
      return NextResponse.json({ ok: true });
    }

    if (text === "/status") {
      const ticket = await mainDb
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.telegramChatId, chatId))
        .orderBy(desc(supportTickets.createdAt))
        .get();

      if (!ticket) {
        await sendMessage(
          chatId,
          "❌ لا توجد لديك تذاكر دعم حالياً.\n\nاكتب استفسارك وسنقوم بإنشاء تذكرة جديدة لك."
        );
      } else {
        const statusEmoji =
          ticket.status === "open"
            ? "🟢"
            : ticket.status === "in_progress"
            ? "🟡"
            : ticket.status === "resolved"
            ? "✅"
            : "⚫";
        const statusText =
          ticket.status === "open"
            ? "مفتوحة"
            : ticket.status === "in_progress"
            ? "قيد المعالجة"
            : ticket.status === "resolved"
            ? "تم الحل"
            : "مغلقة";

        await sendMessage(
          chatId,
          `🎫 <b>آخر تذكرة لك</b>

🔖 <b>الرقم:</b> #${ticket.id.slice(0, 8)}
📝 <b>الموضوع:</b> ${ticket.subject}
${statusEmoji} <b>الحالة:</b> ${statusText}
📅 <b>التاريخ:</b> ${ticket.createdAt.toLocaleDateString("ar-EG")}`
        );
      }
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/reply ") || text.startsWith("/close ") || text.startsWith("/activate ")) {
      const isAdmin = process.env.TELEGRAM_ADMIN_CHAT_ID === chatId;
      
      if (!isAdmin) {
        await sendMessage(chatId, "⛔ هذا الأمر متاح فقط للمسؤولين.");
        return NextResponse.json({ ok: true });
      }

      const parts = text.split(" ");
      const command = parts[0];
      const ticketIdShort = parts[1];
      const replyText = parts.slice(2).join(" ");

      const tickets = await mainDb.select().from(supportTickets).all();
      const ticket = tickets.find((t) => t.id.startsWith(ticketIdShort));

      if (!ticket) {
        await sendMessage(chatId, "❌ لم يتم العثور على التذكرة.");
        return NextResponse.json({ ok: true });
      }

      if (command === "/reply") {
        if (!replyText) {
          await sendMessage(chatId, "❌ يرجى كتابة الرد بعد رقم التذكرة.");
          return NextResponse.json({ ok: true });
        }

        await mainDb.insert(ticketMessages).values({
          id: generateId(),
          ticketId: ticket.id,
          senderType: "admin",
          message: replyText,
          createdAt: new Date(),
        });

        await mainDb
          .update(supportTickets)
          .set({ status: "in_progress", updatedAt: new Date() })
          .where(eq(supportTickets.id, ticket.id));

        await sendMessage(ticket.telegramChatId, formatTicketReply(replyText, true));
        await sendMessage(chatId, `✅ تم إرسال الرد على التذكرة #${ticketIdShort}`);
      } else if (command === "/close") {
        await mainDb
          .update(supportTickets)
          .set({ status: "closed", updatedAt: new Date() })
          .where(eq(supportTickets.id, ticket.id));

        await sendMessage(
          ticket.telegramChatId,
          `✅ <b>تم إغلاق تذكرتك</b> #${ticketIdShort}

شكراً لتواصلك معنا. إذا كان لديك أي استفسار آخر، لا تتردد في التواصل معنا مجدداً.`
        );
        await sendMessage(chatId, `✅ تم إغلاق التذكرة #${ticketIdShort}`);
      } else if (command === "/activate") {
        if (ticket.companyId) {
          await mainDb
            .update(companies)
            .set({ isActive: true })
            .where(eq(companies.id, ticket.companyId));

          await mainDb
            .update(supportTickets)
            .set({ status: "resolved", updatedAt: new Date() })
            .where(eq(supportTickets.id, ticket.id));

          const company = await mainDb
            .select()
            .from(companies)
            .where(eq(companies.id, ticket.companyId))
            .get();

          await sendMessage(
            ticket.telegramChatId,
            `🎉 <b>مبروك! تم تفعيل شركتك</b>

🏢 <b>الشركة:</b> ${company?.name}

يمكنك الآن الدخول للوحة التحكم واستخدام جميع الميزات.

نتمنى لك تجربة ممتعة! 🚀`
          );
          await sendMessage(chatId, `✅ تم تفعيل الشركة ${company?.name}`);
        } else {
          await sendMessage(chatId, "❌ هذه التذكرة ليست مرتبطة بشركة.");
        }
      }

      return NextResponse.json({ ok: true });
    }

    const existingOpenTicket = await mainDb
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.telegramChatId, chatId))
      .orderBy(desc(supportTickets.createdAt))
      .get();

    if (existingOpenTicket && (existingOpenTicket.status === "open" || existingOpenTicket.status === "in_progress")) {
      await mainDb.insert(ticketMessages).values({
        id: generateId(),
        ticketId: existingOpenTicket.id,
        senderType: "customer",
        message: text,
        createdAt: new Date(),
      });

      await mainDb
        .update(supportTickets)
        .set({ updatedAt: new Date() })
        .where(eq(supportTickets.id, existingOpenTicket.id));

      await notifyAdmins(
        `💬 <b>رسالة جديدة في التذكرة #${existingOpenTicket.id.slice(0, 8)}</b>

${text}

للرد: <code>/reply ${existingOpenTicket.id.slice(0, 8)} [رسالتك]</code>`
      );

      await sendMessage(chatId, "✅ تم إرسال رسالتك. سنرد عليك قريباً.");
    } else {
      const ticketId = generateId();
      const now = new Date();
      const subject = text.length > 50 ? text.substring(0, 50) + "..." : text;

      await mainDb.insert(supportTickets).values({
        id: ticketId,
        telegramChatId: chatId,
        telegramUsername: username,
        subject,
        status: "open",
        priority: "medium",
        createdAt: now,
        updatedAt: now,
      });

      await mainDb.insert(ticketMessages).values({
        id: generateId(),
        ticketId: ticketId,
        senderType: "customer",
        message: text,
        createdAt: now,
      });

      await sendMessage(
        chatId,
        `✅ <b>تم إنشاء تذكرة دعم جديدة</b>

🔖 <b>رقم التذكرة:</b> #${ticketId.slice(0, 8)}

سيقوم فريقنا بالرد عليك في أقرب وقت.
يمكنك إرسال المزيد من التفاصيل أو المرفقات.`
      );

      await notifyAdmins(
        formatNewTicketNotification({
          id: ticketId,
          subject,
          username,
          chatId,
        })
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook is active" });
}
