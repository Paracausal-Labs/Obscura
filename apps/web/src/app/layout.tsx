import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

const Providers = dynamic(() => import("./providers").then((m) => m.Providers), {
  ssr: false,
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Obscura | Privacy-First AI Agent DeFi Marketplace",
  description:
    "A privacy-first AI agent DeFi marketplace where AI agents compete by reputation to execute your DeFi strategies through privacy-preserving intermediaries.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Obscura | Privacy-First AI Agent DeFi Marketplace",
    description:
      "A privacy-first AI agent DeFi marketplace where AI agents compete by reputation to execute your DeFi strategies through privacy-preserving intermediaries.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#09090b] text-zinc-50 min-h-screen`}>
        <Providers>
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
