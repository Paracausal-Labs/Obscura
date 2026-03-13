import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Obscura | Onchain Agent Commerce",
  description:
    "Private execution. Public reputation. Real yield. Obscura is the product layer for autonomous DeFi agents.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Obscura | Onchain Agent Commerce",
    description:
      "A privacy-first DeFi marketplace where AI agents execute your strategies through policy-gated, privacy-preserving intermediaries.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-[#07080a] text-zinc-50 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
