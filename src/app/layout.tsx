// src/app/layout.tsx (หรือ layout ของโซนที่ต้องการ)
import "./globals.css";
// import Sidebar from "@/src/components/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50">
        <div className="flex">
          {/* <Sidebar /> */}
          <main className="flex-1 min-h-svh p-6 lg:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
