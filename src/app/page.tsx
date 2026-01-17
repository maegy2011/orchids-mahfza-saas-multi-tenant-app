"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Wallet, 
  ArrowLeft, 
  LayoutDashboard,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-[family-name:var(--font-cairo)]">
      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary">محفظة</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost">لوحة الإدارة</Button>
            </Link>
            <Link href="/login">
              <Button>تسجيل الدخول</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="py-24 px-4 overflow-hidden relative">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                إدارة شركتك وفروعك <br />
                <span className="text-primary italic">بكل سهولة وأمان</span>
              </h1>
              <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                محفظة هي المنصة الأولى في مصر لإدارة المؤسسات والشركات ذات الفروع المتعددة. 
                عزل تام للبيانات، إدارة دقيقة للموظفين، ورقابة مالية شاملة.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 h-14 rounded-2xl">
                  ابدأ الآن مجاناً
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-2xl gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  تعرف على المزيد
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-0 pointer-events-none">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white dark:bg-zinc-900">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">لماذا تختار محفظة؟</h2>
              <p className="text-zinc-600 dark:text-zinc-400">نقدم لك كل ما تحتاجه للنمو والسيطرة على أعمالك</p>
            </div>

            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              <motion.div variants={item}>
                <Card className="h-full hover:shadow-lg transition-shadow border-none bg-zinc-50 dark:bg-zinc-800">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">عزل تام للبيانات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      كل شركة تحصل على قاعدة بيانات مستقلة تماماً لضمان أقصى درجات الخصوصية والأمان.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="h-full hover:shadow-lg transition-shadow border-none bg-zinc-50 dark:bg-zinc-800">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                      <Building2 className="w-6 h-6 text-blue-500" />
                    </div>
                    <CardTitle className="text-xl">إدارة الفروع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      أضف فروعك وخصص مديراً لكل فرع مع صلاحيات محددة وتقارير منفصلة.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="h-full hover:shadow-lg transition-shadow border-none bg-zinc-50 dark:bg-zinc-800">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-green-500" />
                    </div>
                    <CardTitle className="text-xl">نظام موظفين متكامل</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      هيكلية واضحة: مدير شركة، مدير فرع، وموظفين، مع تتبع للأداء والعمليات.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="h-full hover:shadow-lg transition-shadow border-none bg-zinc-50 dark:bg-zinc-800">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                      <LayoutDashboard className="w-6 h-6 text-purple-500" />
                    </div>
                    <CardTitle className="text-xl">لوحة تحكم ذكية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      واجهة مستخدم عصرية وسهلة الاستخدام تدعم اللغة العربية بالكامل وبشكل طبيعي.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pricing/CTA Section */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold mb-8">هل أنت مستعد لتنظيم أعمالك؟</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-right mb-12">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <span className="text-lg">قواعد بيانات SQLite محلية سريعة</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <span className="text-lg">دعم فني مخصص للشركات المصرية</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <span className="text-lg">تحديثات مستمرة وميزات جديدة</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <span className="text-lg">أمان وتشفير عالي للبيانات</span>
              </div>
            </div>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-12 h-16 rounded-2xl font-bold shadow-xl hover:scale-105 transition-transform">
                أنشئ حساب شركتك الآن
              </Button>
            </Link>
          </div>
          
          {/* Decorative shapes */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 -translate-x-1/2 -translate-y-1/2 rounded-full" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 translate-x-1/2 translate-y-1/2 rounded-full" />
        </section>
      </main>

      <footer className="py-12 border-t bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 text-center text-zinc-500 text-sm">
          <p>© {new Date().getFullYear()} محفظة - صنع بكل حب في مصر</p>
        </div>
      </footer>
    </div>
  );
}
