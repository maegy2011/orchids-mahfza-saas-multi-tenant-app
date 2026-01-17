"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function AdminLogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/auth/admin/sign-out", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <Button 
      variant="destructive" 
      className="gap-2" 
      onClick={handleLogout}
      disabled={loading}
    >
      <LogOut className="w-4 h-4" />
      {loading ? "جاري..." : "تسجيل الخروج"}
    </Button>
  );
}
