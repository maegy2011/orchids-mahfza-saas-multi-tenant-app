"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Building2,
  User,
  Send,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  ticketId: string;
  senderType: string;
  message: string;
  createdAt: string;
}

interface Company {
  id: string;
  name: string;
  isActive: boolean;
}

interface TicketWithDetails {
  id: string;
  subject: string;
  status: string;
  telegramChatId: string;
  telegramUsername?: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  company?: Company;
}

export default function SupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [replyMessages, setReplyMessages] = useState<Record<string, string>>({});

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      const res = await fetch("/api/support/tickets");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch {
      console.error("فشل في جلب التذاكر");
    } finally {
      setLoading(false);
    }
  }

  async function handleReply(ticketId: string) {
    const message = replyMessages[ticketId];
    if (!message?.trim()) return;

    setReplyingId(ticketId);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (res.ok) {
        setReplyMessages(prev => ({ ...prev, [ticketId]: "" }));
        fetchTickets();
      }
    } catch {
      console.error("فشل في إرسال الرد");
    } finally {
      setReplyingId(null);
    }
  }

  async function handleClose(ticketId: string) {
    setClosingId(ticketId);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });

      if (res.ok) {
        fetchTickets();
      }
    } catch {
      console.error("فشل في إغلاق التذكرة");
    } finally {
      setClosingId(null);
    }
  }

  async function handleActivate(ticketId: string, companyId: string) {
    setActivatingId(ticketId);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });

      if (res.ok) {
        fetchTickets();
      }
    } catch {
      console.error("فشل في تفعيل الشركة");
    } finally {
      setActivatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 font-[family-name:var(--font-cairo)]" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Ticket className="w-8 h-8" />
              تذاكر الدعم الفني
            </h1>
            <p className="text-zinc-500 mt-1">إدارة طلبات العملاء عبر Telegram</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin">
              <Button variant="outline" className="gap-2">
                <ArrowRight className="w-4 h-4" />
                العودة للوحة
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-green-500 p-3 rounded-xl">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openCount}</p>
                <p className="text-sm text-zinc-500">مفتوحة</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-amber-500 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-sm text-zinc-500">قيد المعالجة</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 bg-zinc-50/50 dark:bg-zinc-800/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-zinc-500 p-3 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resolvedCount}</p>
                <p className="text-sm text-zinc-500">مغلقة</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {tickets.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Ticket className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-zinc-500">لا توجد تذاكر بعد</h3>
                <p className="text-zinc-400 mt-2">ستظهر هنا التذاكر الواردة من Telegram Bot</p>
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id} className={`
                ${ticket.status === "open" ? "border-green-300 bg-green-50/30" : ""}
                ${ticket.status === "in_progress" ? "border-amber-300 bg-amber-50/30" : ""}
                ${ticket.status === "resolved" || ticket.status === "closed" ? "border-zinc-200 opacity-70" : ""}
              `}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          ticket.status === "open" ? "bg-green-500" :
                          ticket.status === "in_progress" ? "bg-amber-500" :
                          "bg-zinc-400"
                        }`} />
                        #{ticket.id.slice(0, 8)} - {ticket.subject}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {ticket.telegramUsername ? `@${ticket.telegramUsername}` : ticket.telegramChatId}
                        </span>
                        {ticket.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {ticket.company.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(ticket.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {ticket.companyId && ticket.company && !ticket.company.isActive && ticket.status !== "resolved" && (
                        <Button 
                          onClick={() => handleActivate(ticket.id, ticket.companyId!)}
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          disabled={activatingId === ticket.id}
                        >
                          {activatingId === ticket.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "تفعيل الشركة"
                          )}
                        </Button>
                      )}
                      {ticket.status !== "closed" && ticket.status !== "resolved" && (
                        <Button 
                          onClick={() => handleClose(ticket.id)}
                          variant="outline" 
                          size="sm"
                          disabled={closingId === ticket.id}
                        >
                          {closingId === ticket.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "إغلاق"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 mb-4 max-h-60 overflow-y-auto space-y-3">
                    {ticket.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.senderType === "admin"
                            ? "bg-primary/10 mr-8"
                            : "bg-white dark:bg-zinc-700 ml-8"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${
                            msg.senderType === "admin" ? "text-primary" : "text-zinc-500"
                          }`}>
                            {msg.senderType === "admin" ? "فريق الدعم" : "العميل"}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {new Date(msg.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  {ticket.status !== "closed" && ticket.status !== "resolved" && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyMessages[ticket.id] || ""}
                        onChange={(e) => setReplyMessages(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                        placeholder="اكتب ردك هنا..."
                        className="flex-1 px-4 py-2 rounded-xl border bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleReply(ticket.id);
                          }
                        }}
                      />
                      <Button 
                        onClick={() => handleReply(ticket.id)}
                        className="gap-2"
                        disabled={replyingId === ticket.id || !replyMessages[ticket.id]?.trim()}
                      >
                        {replyingId === ticket.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        إرسال
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
