"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const yourView = [
    { label: "Scout found Aave v3 4.2% APY", detail: "Groq inference · 1.2s", icon: "🔍" },
    { label: "Ghost executed deposit via BitGo", detail: "Intermediary wallet · $4,200 USDC", icon: "👻" },
    { label: "Fileverse report encrypted", detail: "32-byte hash stored onchain", icon: "🔐" },
    { label: "Projected yield delta: +$823/yr", detail: "Based on current APY band", icon: "📈" },
];

const chainView = [
    { label: "x402 payment tx", detail: "0x8a3f...d921", icon: "⛓" },
    { label: "Escrow release · Job #0047", detail: "0xc1e0...4ab2", icon: "🔓" },
    { label: "BitGo intermediary tx", detail: "0x77a2...88fc", icon: "🏦" },
    { label: "No direct user EOA → DEX path", detail: "Policy confirmed", icon: "🛡" },
];

const pills = [
    { label: "User EOA on DEX", value: "0" },
    { label: "Encrypted docs", value: "31" },
    { label: "Webhook denials", value: "3" },
];

export function PrivacySplitView() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-120px" });

    return (
        <section id="privacy" ref={ref} className="relative w-full py-24 md:py-32 bg-[#07080a] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

            <div className="max-w-[1600px] mx-auto px-6 md:px-12">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-6 text-center"
                >
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                        The chain sees execution.<br className="hidden md:block" />
                        <span className="text-zinc-400"> You keep the strategy.</span>
                    </h2>
                    <p className="mt-5 text-zinc-400 text-base md:text-lg max-w-2xl mx-auto">
                        Obscura removes the direct wallet-to-protocol path without removing accountability.
                    </p>
                </motion.div>

                {/* Metric pills */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-wrap justify-center gap-3 mb-12"
                >
                    {pills.map((p) => (
                        <div key={p.label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/3 backdrop-blur-sm">
                            <span className="text-white font-bold text-sm">{p.value}</span>
                            <span className="text-zinc-500 text-xs">{p.label}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Split panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-0 relative">
                    {/* Left: Your View */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="rounded-2xl md:rounded-r-none border border-white/8 md:border-r-0 bg-[#0c0d12] p-7 overflow-hidden"
                        style={{ boxShadow: "inset 0 0 50px rgba(255,0,51,0.04)" }}
                    >
                        <div className="flex items-center gap-2.5 mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Your View</p>
                        </div>
                        <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-semibold mb-4">Decrypted · Strategy Layer</p>
                        <div className="space-y-3">
                            {yourView.map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={inView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                                    className="flex items-start gap-3 p-4 rounded-xl bg-white/2 border border-white/5"
                                >
                                    <span className="text-lg mt-0.5">{item.icon}</span>
                                    <div>
                                        <p className="text-white text-sm font-medium">{item.label}</p>
                                        <p className="text-zinc-500 text-xs mt-0.5">{item.detail}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Middle divider */}
                    <div className="hidden md:flex absolute left-1/2 top-0 bottom-0 -translate-x-1/2 flex-col items-center z-10">
                        <div className="flex-1 w-px bg-[#ff0033]/20" />
                        <div className="w-8 h-8 rounded-full border border-[#ff0033]/30 bg-[#07080a] flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-[#ff0033]" />
                        </div>
                        <div className="flex-1 w-px bg-[#ff0033]/20" />
                    </div>

                    {/* Right: Chain View */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="rounded-2xl md:rounded-l-none border border-white/8 md:border-l-0 bg-[#0c0d12] p-7 overflow-hidden"
                    >
                        <div className="flex items-center gap-2.5 mb-6">
                            <span className="w-2 h-2 rounded-full bg-zinc-500" />
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Chain View</p>
                        </div>
                        <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-semibold mb-4">Public · Execution Layer</p>
                        <div className="space-y-3">
                            {chainView.map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={inView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                                    className="flex items-start gap-3 p-4 rounded-xl bg-white/2 border border-white/5"
                                >
                                    <span className="text-lg mt-0.5">{item.icon}</span>
                                    <div>
                                        <p className="text-zinc-300 text-sm font-medium">{item.label}</p>
                                        <p className="text-zinc-600 text-xs mt-0.5 font-mono">{item.detail}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
