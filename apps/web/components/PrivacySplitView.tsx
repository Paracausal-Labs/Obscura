"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const yourView = [
    { label: "Scout found Aave v3 4.2% APY", detail: "Groq inference · 1.2s", icon: "◉" },
    { label: "Ghost executed deposit via BitGo", detail: "Intermediary wallet · $4,200 USDC", icon: "◈" },
    { label: "Fileverse report encrypted", detail: "32-byte hash stored onchain", icon: "◎" },
    { label: "Projected yield delta: +$823/yr", detail: "Based on current APY band", icon: "◆" },
];
const chainView = [
    { label: "x402 payment tx", detail: "0x8a3f...d921", icon: "⬡" },
    { label: "Escrow release · Job #0047", detail: "0xc1e0...4ab2", icon: "⬡" },
    { label: "BitGo intermediary tx", detail: "0x77a2...88fc", icon: "⬡" },
    { label: "No direct user EOA → DEX path", detail: "Policy confirmed", icon: "⬡" },
];
const pills = [
    { label: "User EOA on DEX", value: "0" },
    { label: "Encrypted docs", value: "31" },
    { label: "Webhook denials", value: "3" },
];

export function PrivacySplitView() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section id="privacy" ref={ref} className="relative w-full py-24 md:py-32 bg-[#07080a] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
            {/* Ambient glows — red + silver */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[300px] rounded-full blur-[140px] opacity-[0.06]" style={{ background: "#ff0033" }} />
            </div>
            <div className="absolute top-0 left-[10%] w-[500px] h-[400px] rounded-full blur-[160px] opacity-[0.04] pointer-events-none bg-zinc-300" />
            <div className="absolute bottom-0 right-[5%] w-[450px] h-[300px] rounded-full blur-[140px] opacity-[0.04] pointer-events-none bg-zinc-200" />

            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }} className="text-center mb-6"
                >
                    <p className="text-[#ff0033] uppercase tracking-widest text-[11px] font-semibold mb-4">Privacy by default</p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight mb-4">
                        The chain sees execution.<br />
                        <span className="text-zinc-500">You keep the strategy.</span>
                    </h2>
                    <p className="text-zinc-400 text-base max-w-xl mx-auto mb-8">
                        Obscura removes the direct wallet-to-protocol path without removing accountability.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2.5">
                        {pills.map((p) => (
                            <div key={p.label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/8 bg-white/3">
                                <span className="text-white font-black text-sm">{p.value}</span>
                                <span className="text-zinc-500 text-xs">{p.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Outer container */}
                <div className="relative rounded-[2rem] border border-[#ff0033]/12 bg-[#0c0d12] p-5 md:p-6 overflow-hidden shadow-[0_0_0_1px_rgba(255,0,51,0.08),inset_0_0_60px_rgba(255,0,51,0.03)] mt-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[120px] rounded-full blur-[70px] opacity-[0.04] pointer-events-none bg-white" />

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-5 md:gap-0">
                        {/* Your View */}
                        <motion.div
                            initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="p-4 md:p-5"
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Your View</p>
                                <span className="ml-2 px-2 py-0.5 rounded-md border border-white/6 bg-white/3 text-zinc-600 text-[9px]">Decrypted</span>
                            </div>
                            <div className="space-y-2">
                                {yourView.map((item, i) => (
                                    <motion.div key={item.label}
                                        initial={{ opacity: 0, x: -12 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                                        transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                                        className="flex items-start gap-3 p-3.5 rounded-xl bg-white/2 border border-white/5 hover:border-[#ff0033]/15 transition-colors"
                                    >
                                        <span className="text-zinc-600 text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                                        <div>
                                            <p className="text-white text-xs font-medium">{item.label}</p>
                                            <p className="text-zinc-600 text-[10px] mt-0.5">{item.detail}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Divider */}
                        <div className="hidden md:flex flex-col items-center justify-center">
                            <div className="flex-1 w-px bg-[#ff0033]/10" />
                            <div className="w-8 h-8 rounded-full border border-[#ff0033]/20 bg-[#07080a] flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-[#ff0033]" />
                            </div>
                            <div className="flex-1 w-px bg-[#ff0033]/10" />
                        </div>

                        {/* Chain View */}
                        <motion.div
                            initial={{ opacity: 0, x: 24 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="p-4 md:p-5"
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Chain View</p>
                                <span className="ml-2 px-2 py-0.5 rounded-md border border-white/6 bg-white/3 text-zinc-600 text-[9px]">Public</span>
                            </div>
                            <div className="space-y-2">
                                {chainView.map((item, i) => (
                                    <motion.div key={item.label}
                                        initial={{ opacity: 0, x: 12 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                                        transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                                        className="flex items-start gap-3 p-3.5 rounded-xl bg-white/2 border border-white/5 hover:border-white/8 transition-colors"
                                    >
                                        <span className="text-zinc-700 text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                                        <div>
                                            <p className="text-zinc-400 text-xs font-medium">{item.label}</p>
                                            <p className="text-zinc-700 text-[10px] mt-0.5 font-mono">{item.detail}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
