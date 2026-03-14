"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

const Providers = dynamic(
  () => import("../providers").then((m) => m.Providers),
  { ssr: false }
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="relative min-h-screen bg-[#07080a] overflow-hidden">
        {/* Premium Background Blurs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff0033]/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#07080a_100%)] pointer-events-none" />

        <Header />
        <div className="flex relative z-10 min-h-[calc(100vh-4rem)]">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 overflow-auto relative">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  );
}
