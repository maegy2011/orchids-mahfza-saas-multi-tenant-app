const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    title?: string;
  };
  date: number;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export async function sendMessage(chatId: string | number, text: string, options?: {
  parse_mode?: 'HTML' | 'Markdown';
  reply_markup?: object;
}) {
  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: options?.parse_mode || 'HTML',
      reply_markup: options?.reply_markup,
    }),
  });
  return response.json();
}

export async function notifyAdmins(text: string) {
  if (!ADMIN_CHAT_ID) {
    console.warn('TELEGRAM_ADMIN_CHAT_ID not set');
    return;
  }
  return sendMessage(ADMIN_CHAT_ID, text);
}

export function getWelcomeMessage(): string {
  return `مرحباً بك في الدعم الفني لـ <b>محفظة</b> 👋

كيف يمكنني مساعدتك اليوم؟

📝 <b>الأوامر المتاحة:</b>
/start - بدء محادثة جديدة
/status - حالة تذكرتي
/help - المساعدة

💡 أو اكتب استفسارك مباشرة وسنرد عليك في أقرب وقت.`;
}

export function getHelpMessage(): string {
  return `📚 <b>مركز المساعدة</b>

<b>كيفية استخدام البوت:</b>
1. اكتب استفسارك أو مشكلتك مباشرة
2. سيتم إنشاء تذكرة دعم تلقائياً
3. سيرد عليك فريق الدعم في أقرب وقت

<b>الأوامر:</b>
/start - بدء محادثة جديدة
/status - معرفة حالة تذكرتك
/help - عرض هذه الرسالة

<b>أوقات العمل:</b>
السبت - الخميس: 9 صباحاً - 6 مساءً

للاستفسارات العاجلة: support@mahfza.com`;
}

export function formatNewTicketNotification(ticket: {
  id: string;
  subject: string;
  username?: string;
  chatId: string;
  companyId?: string;
}): string {
  return `🎫 <b>تذكرة جديدة #${ticket.id.slice(0, 8)}</b>

📝 <b>الموضوع:</b> ${ticket.subject}
👤 <b>المستخدم:</b> ${ticket.username ? `@${ticket.username}` : ticket.chatId}
🏢 <b>الشركة:</b> ${ticket.companyId || 'زائر'}

للرد: <code>/reply ${ticket.id.slice(0, 8)} [رسالتك]</code>`;
}

export function formatTicketReply(message: string, isAdmin: boolean): string {
  const icon = isAdmin ? '👨‍💼' : '👤';
  const label = isAdmin ? 'فريق الدعم' : 'العميل';
  return `${icon} <b>${label}:</b>\n${message}`;
}

export async function setWebhook(url: string) {
  const response = await fetch(`${TELEGRAM_API}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return response.json();
}

export async function deleteWebhook() {
  const response = await fetch(`${TELEGRAM_API}/deleteWebhook`, {
    method: 'POST',
  });
  return response.json();
}

export async function getWebhookInfo() {
  const response = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
  return response.json();
}
