"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Wallet, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/admin/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (res.ok) {
        window.location.href = "/admin";
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center p-4 font-[family-name:var(--font-cairo)]" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-primary p-2 rounded-xl">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-white">محفظة</span>
          </Link>
        </div>

        <Card className="shadow-2xl border-none bg-zinc-900/80 backdrop-blur-md">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-2xl text-white">لوحة تحكم النظام</CardTitle>
            <CardDescription className="text-zinc-400">دخول للمسؤولين فقط</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-zinc-300">البريد الإلكتروني</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mahfza.com"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <div>
                  <label className="text-sm font-medium mb-1 block text-zinc-300">كلمة المرور</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-zinc-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-zinc-300 cursor-pointer">
                    تذكرني لمدة 30 يوم
                  </label>
                </div>

                {error && (
                <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg">{error}</p>
              )}

              <Button type="submit" className="w-full h-12 text-lg bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? "جاري الدخول..." : "دخول لوحة الإدارة"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-zinc-400 hover:text-zinc-200 text-sm inline-flex items-center gap-1">
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
