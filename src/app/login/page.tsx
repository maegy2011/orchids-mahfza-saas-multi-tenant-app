"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, Building2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [companySlug, setCompanySlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/auth/tenant/${companySlug}/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        window.location.href = `/c/${companySlug}`;
      } else {
        setError("بيانات الدخول غير صحيحة");
      }
    } catch {
      setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

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
            <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
            <CardDescription>ادخل إلى لوحة تحكم شركتك</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">معرف الشركة (Slug)</label>
                <Input
                  value={companySlug}
                  onChange={(e) => setCompanySlug(e.target.value)}
                  placeholder="مثال: nile-trade"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">البريد الإلكتروني</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@company.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">كلمة المرور</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>
              )}

              <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                {loading ? "جاري الدخول..." : "دخول"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-zinc-500">
              <p>ليس لديك حساب؟</p>
              <Link href="/register" className="text-primary font-medium hover:underline">
                سجل شركتك الآن
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
