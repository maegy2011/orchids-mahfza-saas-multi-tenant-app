import { getTenantDb, mainDb } from "@/lib/db/db";
import { companies } from "@/lib/db/schema-main";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Users, 
  Wallet, 
  ArrowRight,
  LayoutDashboard,
  TrendingUp,
  MapPin,
  Lock,
  MessageCircle,
  Clock
} from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TenantDashboard({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;

  const company = await mainDb.select().from(companies).where(eq(companies.id, tenantId)).get();

  if (!company) {
    notFound();
  }

  getTenantDb(tenantId);

  if (!company.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-900 dark:to-zinc-950 font-[family-name:var(--font-cairo)]" dir="rtl">
        <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 dark:bg-zinc-900/80 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500/20 p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="font-bold text-xl">{company.name}</h1>
                <p className="text-xs text-amber-600 font-medium">في انتظار التفعيل</p>
              </div>
            </div>
            <Link href="/">
               <Button variant="ghost" className="gap-2">
                 الخروج
                 <ArrowRight className="w-4 h-4" />
               </Button>
            </Link>
          </div>
        </header>

        <main className="max-w-3xl mx-auto p-6 md:p-8">
          <Card className="border-none shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-2">حسابك في انتظار التفعيل</h2>
              <p className="text-amber-100">تم تسجيل شركتك بنجاح وهي الآن قيد المراجعة</p>
            </div>
            
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-amber-600" />
                    الميزات المعطلة حالياً
                  </h3>
                  <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-zinc-300 rounded-full" />
                      إضافة وإدارة الفروع
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-zinc-300 rounded-full" />
                      إضافة وإدارة الموظفين
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-zinc-300 rounded-full" />
                      العمليات المالية والمحفظة
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-zinc-300 rounded-full" />
                      التقارير والإحصائيات
                    </li>
                  </ul>
                </div>

<div className="text-center space-y-4">
                    <p className="text-zinc-500">
                      للتفعيل، يرجى التواصل مع فريق الدعم الفني
                    </p>
                    <a href={`https://t.me/mahfza_support_bot?start=activate_${company.id}`} target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="bg-[#0088cc] hover:bg-[#006699] text-white h-14 px-8 text-lg gap-3 rounded-2xl">
                        <MessageCircle className="w-6 h-6" />
                        تواصل عبر Telegram
                      </Button>
                    </a>
                    <p className="text-sm text-zinc-400">
                      أو راسلنا على: support@mahfza.com
                    </p>
                  </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-3">بيانات شركتك:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-400">اسم الشركة:</span>
                      <p className="font-medium">{company.name}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">المعرف:</span>
                      <p className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded inline-block">{company.slug}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">البريد الإلكتروني:</span>
                      <p className="font-medium">{company.managerEmail}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">تاريخ التسجيل:</span>
                      <p className="font-medium">{company.createdAt.toLocaleDateString('ar-EG')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-[family-name:var(--font-cairo)]" dir="rtl">
      <header className="bg-white border-b sticky top-0 z-40 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-xl">{company.name}</h1>
              <p className="text-xs text-zinc-500">لوحة تحكم الشركة</p>
            </div>
          </div>
          <Link href="/">
             <Button variant="ghost" className="gap-2">
               الخروج
               <ArrowRight className="w-4 h-4" />
             </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-8 flex items-center gap-3 dark:bg-green-900/20 dark:border-green-900/30">
          <div className="bg-green-500 p-2 rounded-full">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <p className="text-green-700 text-sm font-medium dark:text-green-300">
            حسابك مفعل بالكامل - قاعدة بيانات معزولة: <code className="bg-green-100 px-2 py-0.5 rounded dark:bg-green-800">{company.dbPath}</code>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">إجمالي الفروع</CardTitle>
              <MapPin className="w-4 h-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-zinc-400 mt-1">ابدأ بإضافة أول فرع</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">الموظفين</CardTitle>
              <Users className="w-4 h-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-green-500 mt-1">أنت (المدير)</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">رصيد المحفظة</CardTitle>
              <Wallet className="w-4 h-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0.00 ج.م</div>
              <p className="text-xs text-zinc-400 mt-1">لا توجد عمليات بعد</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">معدل النمو</CardTitle>
              <TrendingUp className="w-4 h-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-zinc-400 mt-1">جديد</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات السريعة</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl">
                <MapPin className="w-6 h-6" />
                إضافة فرع
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl">
                <Users className="w-6 h-6" />
                إضافة موظف
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
