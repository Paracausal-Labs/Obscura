"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const navLinks = {
  product: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Agents", href: "#agents" },
    { label: "Privacy", href: "#privacy" },
  ],
  developers: [
    { label: "Architecture", href: "#architecture" },
    { label: "GitHub", href: "https://github.com/Paracausal-Labs/Obscura" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "mailto:paracausal.labs@gmail.com" },
  ],
};

const infraLogos = ["ENS", "BitGo", "Base", "Groq", "Fileverse"];

export function Footer() {
  return (
    <footer className="relative w-full bg-[#07080a] overflow-hidden">
      <div className="relative border-t border-white/5 py-24 md:py-32">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[700px] h-[350px] rounded-full blur-[140px] opacity-[0.09]"
            style={{ background: "#ff0033" }}
          />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="relative rounded-[2rem] border border-[#ff0033]/[0.15] bg-[#0c0d12] p-12 md:p-16 text-center overflow-hidden shadow-[0_0_0_1px_rgba(255,0,51,0.10),inset_0_0_80px_rgba(255,0,51,0.04)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full blur-[80px] opacity-[0.07] pointer-events-none bg-white" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/40 to-transparent" />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <p className="text-[#ff0033] uppercase tracking-widest text-[11px] font-semibold mb-6">
                Get started
              </p>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-[1.08] tracking-tight mb-6">
                Private execution.
                <br />
                Public reputation.
                <br />
                <span className="text-zinc-500">Real yield.</span>
              </h2>
              <p className="text-zinc-500 text-base md:text-lg max-w-lg mx-auto mb-10">
                Obscura is the product layer for autonomous DeFi agents.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="px-8 py-3.5 rounded-full border border-white/10 text-white text-sm font-medium hover:bg-white/5 hover:border-[#ff0033]/30 transition-all backdrop-blur-md"
                >
                  View Demo
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-3.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  Open App →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 py-12">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="Obscura"
                  width={28}
                  height={28}
                  className="w-6 h-6 object-contain"
                />
                <span className="text-white font-semibold tracking-[0.15em] text-sm uppercase">
                  Obscura
                </span>
              </div>
              <p className="text-zinc-700 text-xs leading-relaxed max-w-[180px]">
                The product layer for autonomous DeFi agents.
              </p>
            </div>
            <div>
              <p className="text-zinc-600 text-[9px] uppercase tracking-widest font-semibold mb-4">
                Product
              </p>
              <div className="space-y-2.5">
                {navLinks.product.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="block text-zinc-600 text-xs hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-zinc-600 text-[9px] uppercase tracking-widest font-semibold mb-4">
                Developers
              </p>
              <div className="space-y-2.5">
                {navLinks.developers.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="block text-zinc-600 text-xs hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-zinc-600 text-[9px] uppercase tracking-widest font-semibold mb-4">
                Company
              </p>
              <div className="space-y-2.5">
                {navLinks.company.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="block text-zinc-600 text-xs hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-700 text-xs">
              &copy; 2026 Obscura. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-zinc-700 text-xs flex-wrap justify-center">
              <span className="mr-1">Infrastructure:</span>
              {infraLogos.map((l, i) => (
                <span key={l}>
                  <span className="text-zinc-600 font-medium">{l}</span>
                  {i < infraLogos.length - 1 && (
                    <span className="mx-1.5 text-zinc-800">&middot;</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
