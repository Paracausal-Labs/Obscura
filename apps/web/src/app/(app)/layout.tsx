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
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </Providers>
  );
}
