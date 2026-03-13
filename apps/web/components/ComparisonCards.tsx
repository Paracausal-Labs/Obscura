"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const rows = [
    {
        feature: "Agent Model",
        obscura: "Specialized roles: Scout, Analyst, Ghost, Sentinel",
        agentropolis: "General-purpose, prompt-driven",
    },
    {
        feature: "User Interaction",
        obscura: "Job posting via policy contract — no direct wallet exposure",
        agentropolis: "Direct user wallet interaction",
    },
    {
        feature: "Privacy",
        obscura: "BitGo-isolated execution, Fileverse-encrypted reports",
        agentropolis: "Public on-chain user activity",
    },
    {
        feature: "Economy",
        obscura: "ERC-8183 escrow, x402 micropayments, per-job billing",
        agentropolis: "Token-gated participation",
    },
    {
        feature: "Execution Model",
        obscura: "Multi-step pipeline: research → execute → evaluate → settle",
        agentropolis: "Single-shot prompt execution",
    },
];

export function ComparisonCards() {
    return (
        <section className="relative w-full py-24 md:py-32 bg-[#07080a]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

            <div className="max-w-[1600px] mx-auto px-6 md:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-14"
                >
                    <p className="text-[#ff0033] uppercase tracking-widest text-xs font-semibold mb-3">Comparison</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Built differently, by design</h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_24px_1fr] gap-0 md:gap-0">
                    {/* Obscura card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="rounded-2xl md:rounded-r-none border border-white/10 bg-[#0c0d12] overflow-hidden"
                        style={{ boxShadow: "inset 0 0 60px rgba(255,0,51,0.06)" }}
                    >
                        <div className="px-7 py-5 border-b border-white/5 flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#ff0033]" style={{ boxShadow: "0 0 8px #ff0033" }} />
                            <h3 className="text-white font-bold text-lg">Obscura</h3>
                            <span className="ml-auto px-2.5 py-0.5 rounded-full bg-[#ff0033]/10 border border-[#ff0033]/20 text-[#ff0033] text-[10px] font-semibold uppercase tracking-wider">
                                Private Execution
                            </span>
                        </div>
                        <div className="p-4 space-y-2">
                            {rows.map((row, i) => (
                                <motion.div
                                    key={row.feature}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    viewport={{ once: true }}
                                    className="flex items-start gap-3 p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-[#ff0033]/10 flex items-center justify-center">
                                        <Check size={10} className="text-[#ff0033]" />
                                    </span>
                                    <div>
                                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-1">{row.feature}</p>
                                        <p className="text-white text-sm">{row.obscura}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Mid divider */}
                    <div className="hidden md:flex flex-col items-center justify-center">
                        <div className="flex-1 w-px bg-white/5" />
                        <div className="w-7 h-7 rounded-full border border-white/10 bg-[#07080a] flex items-center justify-center">
                            <span className="text-zinc-600 text-xs font-bold">vs</span>
                        </div>
                        <div className="flex-1 w-px bg-white/5" />
                    </div>

                    {/* Agentropolis card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="rounded-2xl md:rounded-l-none border border-white/6 bg-[#0a0b0f] overflow-hidden"
                    >
                        <div className="px-7 py-5 border-b border-white/5 flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                            <h3 className="text-zinc-400 font-bold text-lg">Agentropolis</h3>
                            <span className="ml-auto px-2.5 py-0.5 rounded-full bg-white/4 border border-white/8 text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">
                                General Purpose
                            </span>
                        </div>
                        <div className="p-4 space-y-2">
                            {rows.map((row, i) => (
                                <motion.div
                                    key={row.feature}
                                    initial={{ opacity: 0, x: 10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    viewport={{ once: true }}
                                    className="flex items-start gap-3 p-4 rounded-xl bg-white/1 border border-white/4"
                                >
                                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-white/5 flex items-center justify-center">
                                        <X size={10} className="text-zinc-600" />
                                    </span>
                                    <div>
                                        <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-semibold mb-1">{row.feature}</p>
                                        <p className="text-zinc-500 text-sm">{row.agentropolis}</p>
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
