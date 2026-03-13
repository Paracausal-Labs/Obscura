"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEnsIdentity } from "@/hooks/useEnsIdentity";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/privacy", label: "Privacy" },
];

export function Header() {
  const pathname = usePathname();
  const { ready, authenticated, login, logout, user } = usePrivy();

  const walletAddress = user?.wallet?.address as `0x${string}` | undefined;
  const { ensName, ensAvatar, displayName } = useEnsIdentity(walletAddress);

  return (
    <header className="border-b border-white/[0.06] bg-[#07080a]/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 md:px-6 h-14 md:h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[#ff0033] text-xl">{"\u25C8"}</span>
            <span className="font-bold text-lg tracking-[0.1em] uppercase text-white">OBSCURA</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-[#ff0033]/10 text-[#ff0033]"
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c0d12] border border-white/[0.06] text-sm text-zinc-300 hover:border-white/[0.12] transition-colors"
            >
              {ensAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ensAvatar} alt="ENS avatar" className="w-5 h-5 rounded-full" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-[#ff0033]" />
              )}
              <span className={ensName ? "text-[#ff0033]" : ""}>
                {displayName}
              </span>
            </button>
          ) : (
            <button
              onClick={login}
              className="px-4 py-1.5 rounded-xl bg-[#ff0033] hover:bg-[#ff1a40] text-sm font-medium text-white transition-colors"
            >
              Connect
            </button>
          )
        )}
      </div>
    </header>
  );
}
