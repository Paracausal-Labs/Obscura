"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/privacy", label: "Privacy" },
];

export function Header() {
  const pathname = usePathname();
  const { ready, authenticated, login, logout, user } = usePrivy();

  const walletAddress = user?.wallet?.address;
  const truncated = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  return (
    <header className="border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 md:px-6 h-14 md:h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-violet-500 text-xl">{"\u25C8"}</span>
            <span className="font-bold text-lg tracking-tight">OBSCURA</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-violet-500/10 text-violet-400"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        {ready && (
          authenticated ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {truncated}
            </button>
          ) : (
            <button
              onClick={login}
              className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-sm font-medium transition-colors"
            >
              Connect
            </button>
          )
        )}
      </div>
    </header>
  );
}
