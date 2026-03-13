"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const navLinks = {
    product: [
        { label: "Dashboard", href: "#" },
        { label: "Agents", href: "#agents" },
        { label: "Privacy", href: "#privacy" },
    ],
    developers: [
        { label: "Documentation", href: "#" },
        { label: "Architecture", href: "#architecture" },
        { label: "GitHub", href: "#" },
    ],
    company: [
        { label: "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Contact", href: "#" },
    ],
};

const infraLogos = ["ENS", "BitGo", "Base", "Groq", "Fileverse"];

export function Footer() {
    return (
        <footer className="relative w-full bg-[#07080a] overflow-hidden">
            {/* CTA block */}
            <div className="relative border-t border-white/5 py-24 md:py-32">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/20 to-transparent" />
                {/* Background glow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[600px] h-[300px] rounded-full blur-[120px] opacity-10" style={{ background: "#ff0033" }} />
                </div>

                <div className="relative max-w-[1600px] mx-auto px-6 md:px-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-[#ff0033] uppercase tracking-widest text-xs font-semibold mb-6">Get started</p>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
                            Private execution.<br />Public reputation.<br />
                            <span className="text-zinc-500">Real yield.</span>
                        </h2>
                        <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto mb-10">
                            Obscura is the product layer for autonomous DeFi agents.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-colors backdrop-blur-md">
                                View Demo
                            </button>
                            <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black text-sm font-black hover:bg-zinc-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                Open App →
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Footer links */}
            <div className="border-t border-white/5 py-12">
                <div className="max-w-[1600px] mx-auto px-6 md:px-12">

                    {/* Top: logo + nav */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <Image src="/logo.png" alt="Obscura" width={32} height={32} className="w-7 h-7 object-contain" />
                                <span className="text-white font-black tracking-[0.15em] text-sm uppercase" style={{ fontFamily: "Impact, sans-serif" }}>Obscura</span>
                            </div>
                            <p className="text-zinc-600 text-xs leading-relaxed max-w-[200px]">
                                The product layer for autonomous DeFi agents.
                            </p>
                        </div>

                        <div>
                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-4">Product</p>
                            <div className="space-y-2.5">
                                {navLinks.product.map((l) => (
                                    <Link key={l.label} href={l.href} className="block text-zinc-500 text-sm hover:text-white transition-colors">{l.label}</Link>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-4">Developers</p>
                            <div className="space-y-2.5">
                                {navLinks.developers.map((l) => (
                                    <Link key={l.label} href={l.href} className="block text-zinc-500 text-sm hover:text-white transition-colors">{l.label}</Link>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-4">Company</p>
                            <div className="space-y-2.5">
                                {navLinks.company.map((l) => (
                                    <Link key={l.label} href={l.href} className="block text-zinc-500 text-sm hover:text-white transition-colors">{l.label}</Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Infra logos */}
                    <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-zinc-700 text-xs">© 2025 Obscura. All rights reserved.</p>

                        <div className="flex items-center gap-1 text-zinc-700 text-xs">
                            <span>Infrastructure:</span>
                            {infraLogos.map((l, i) => (
                                <span key={l}>
                                    <span className="text-zinc-600 font-semibold">{l}</span>{i < infraLogos.length - 1 && <span className="mx-1 text-zinc-800">·</span>}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
