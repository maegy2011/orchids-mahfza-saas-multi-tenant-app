import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "محفظة - Mahfza",
  description: "نظام إدارة الشركات والفروع والموظفين في مصر",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans antialiased`}>
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="0162498c-d3fe-40a1-acb1-ca6bbb1996e7"
        />
        {children}
      </body>
    </html>
  );
}
