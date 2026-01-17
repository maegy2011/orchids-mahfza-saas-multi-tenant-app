"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus, ExternalLink, CheckCircle2, XCircle, Power, Ticket, Loader2 } from "lucide-react";
import Link from "next/link";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { useRouter } from "next/navigation";

interface Company {
  id: string;
  name: string;
  slug: string;
  managerEmail: string;
  isActive: boolean;
  dbPath: string;
  createdAt: Date;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [managerEmail, setManagerEmail] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    try {
      const res = await fetch("/api/companies");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch {
      setError("فشل في جلب الشركات");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterCompany(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, managerEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل في إنشاء الشركة");
      }

      setName("");
      setSlug("");
      setManagerEmail("");
      fetchCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(companyId: string) {
    setTogglingId(companyId);
    try {
      const res = await fetch(`/api/companies/${companyId}/toggle`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setCompanies(companies.map(c => 
          c.id === companyId ? { ...c, isActive: data.isActive } : c
        ));
      }
    } catch {
      setError("فشل في تغيير حالة الشركة");
    } finally {
      setTogglingId(null);
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold">لوحة تحكم النظام (Admin)</h1>
          <div className="flex gap-2">
            <Link href="/admin/support">
              <Button variant="outline" className="gap-2">
                <Ticket className="w-4 h-4" />
                الدعم الفني
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">العودة للرئيسية</Button>
            </Link>
            <AdminLogoutButton />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  إضافة شركة جديدة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegisterCompany} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">اسم الشركة</label>
                    <Input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثلاً: شركة النيل للتجارة" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">المعرف (Slug)</label>
                    <Input 
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s/g, "-"))}
                      placeholder="nile-trade" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">بريد المدير المسئول</label>
                    <Input 
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      type="email" 
                      placeholder="manager@company.com" 
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        جاري الإنشاء...
                      </>
                    ) : (
                      "إنشاء الشركة وقاعدة البيانات"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  الشركات المسجلة ({companies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companies.length === 0 ? (
                    <p className="text-center text-zinc-500 py-8">لا يوجد شركات مسجلة بعد</p>
                  ) : (
                    companies.map((company) => (
                      <div key={company.id} className={`flex items-center justify-between p-4 border rounded-xl transition-colors ${company.isActive ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10' : 'bg-amber-50/50 border-amber-200 dark:bg-amber-900/10'}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{company.name}</h3>
                            {company.isActive ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                مفعل
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                <XCircle className="w-3 h-3" />
                                غير مفعل
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-zinc-500">{company.managerEmail}</p>
                          <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded mt-2 inline-block">{company.slug}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={() => handleToggleStatus(company.id)}
                            variant={company.isActive ? "destructive" : "default"}
                            size="sm"
                            className="gap-2"
                            disabled={togglingId === company.id}
                          >
                            {togglingId === company.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                            {company.isActive ? "تعطيل" : "تفعيل"}
                          </Button>
                          <Link href={`/c/${company.id}`}>
                            <Button variant="outline" size="sm" className="gap-2">
                              <ExternalLink className="w-4 h-4" />
                              زيارة
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
