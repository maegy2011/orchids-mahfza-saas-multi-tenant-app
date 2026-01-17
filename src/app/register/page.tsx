"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, Building2, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [companyId, setCompanyId] = useState("");

  // Step 1: Company Info
  const [companyName, setCompanyName] = useState("");
  const [companySlug, setCompanySlug] = useState("");

  // Step 2: Manager Info
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPassword, setManagerPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create company via server action (which creates the tenant DB)
      const formData = new FormData();
      formData.append("name", companyName);
      formData.append("slug", companySlug);
      formData.append("managerEmail", managerEmail);

      const companyRes = await fetch("/api/companies", {
        method: "POST",
        body: JSON.stringify({
          name: companyName,
          slug: companySlug,
          managerEmail,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const companyData = await companyRes.json();
      
      if (!companyRes.ok) {
        throw new Error(companyData.error || "فشل في إنشاء الشركة");
      }

      const { companyId: newCompanyId } = companyData;
      setCompanyId(newCompanyId);

      // 2. Create the manager user in tenant DB
      const userRes = await fetch(`/api/auth/tenant/${newCompanyId}/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: managerName,
          email: managerEmail,
          password: managerPassword,
        }),
      });

      const userData = await userRes.json();

      if (!userRes.ok) {
        throw new Error(userData.message || "فشل في إنشاء حساب المدير");
      }

      // 3. Update user role to manager
      await fetch("/api/companies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: newCompanyId,
          userId: userData.user.id,
          role: "manager",
        }),
      });

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4 font-[family-name:var(--font-cairo)]" dir="rtl">
        <Card className="w-full max-w-md shadow-2xl border-none text-center">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">تم إنشاء شركتك بنجاح!</h2>
            <p className="text-zinc-500 mb-6">يمكنك الآن الدخول إلى لوحة التحكم</p>
            <div className="bg-zinc-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-zinc-500">معرف شركتك:</p>
              <code className="text-primary font-mono text-lg">{companyId}</code>
            </div>
            <Link href={`/c/${companyId}`}>
              <Button className="w-full h-12 text-lg">دخول لوحة التحكم</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4 font-[family-name:var(--font-cairo)]" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-primary p-2 rounded-xl">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">محفظة</span>
          </Link>
        </div>

        <Card className="shadow-2xl border-none">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">تسجيل شركة جديدة</CardTitle>
            <CardDescription>
              {step === 1 ? "الخطوة 1: بيانات الشركة" : "الخطوة 2: بيانات المدير"}
            </CardDescription>

            {/* Progress */}
            <div className="flex gap-2 mt-4">
              <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-zinc-200"}`} />
              <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-zinc-200"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={step === 2 ? handleRegister : (e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
              {step === 1 ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block">اسم الشركة</label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="مثال: شركة النيل للتجارة"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">معرف الشركة (Slug)</label>
                    <Input
                      value={companySlug}
                      onChange={(e) => setCompanySlug(e.target.value.toLowerCase().replace(/\s/g, "-"))}
                      placeholder="nile-trade"
                      required
                    />
                    <p className="text-xs text-zinc-400 mt-1">سيُستخدم في الرابط: /c/{companySlug || "slug"}</p>
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg">
                    التالي
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block">اسم المدير</label>
                    <Input
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      placeholder="أحمد محمد"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">البريد الإلكتروني</label>
                    <Input
                      type="email"
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      placeholder="manager@company.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">كلمة المرور</label>
                    <Input
                      type="password"
                      value={managerPassword}
                      onChange={(e) => setManagerPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>
                  )}

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>
                      رجوع
                    </Button>
                    <Button type="submit" className="flex-1 h-12 text-lg" disabled={loading}>
                      {loading ? "جاري التسجيل..." : "إنشاء الشركة"}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6 text-center text-sm text-zinc-500">
              <p>لديك حساب بالفعل؟</p>
              <Link href="/login" className="text-primary font-medium hover:underline">
                تسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-zinc-500 hover:text-zinc-700 text-sm inline-flex items-center gap-1">
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
