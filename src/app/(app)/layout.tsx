// src/app/(app)/layout.tsx
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/src/components/layout/Sidebar";
import { User } from "@/src/types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const user: Partial<User> = {
    full_name: "Somchai Boonmee",
    email: "somchai@example.com",
  };

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar
        user={user}
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto min-w-0">
          <section className="p-4">{children}</section>
        </div>
      </main>
    </div>
  );
}
