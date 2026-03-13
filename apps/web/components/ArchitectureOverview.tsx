"use client";

import { motion } from "framer-motion";

const layers = [
    {
        id: "onchain",
        label: "Onchain",
        color: "#ff0033",
        items: ["Base Sepolia", "AgentJobs Contract", "ERC-8183 Escrow", "ERC-8004 Identity / Reputation"],
    },
    {
        id: "identity",
        label: "Identity & Policy",
        color: "#f59e0b",
        items: ["ENS Names", "ENSIP-25 Preferences", "Risk Parameters", "Kill Switch"],
    },
    {
        id: "offchain",
        label: "Offchain Infrastructure",
        color: "#3b82f6",
        items: ["Groq LLM Inference", "HeyElsa Research", "AgentCash x402", "BitGo Custody", "Fileverse Encryption"],
    },
];

export function ArchitectureOverview() {
    return (
        <section id="architecture" className="relative w-full py-24 md:py-32 bg-[#07080a]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

            <div className="max-w-[1600px] mx-auto px-6 md:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-6"
                >
                    <p className="text-[#ff0033] uppercase tracking-widest text-xs font-semibold mb-3">Architecture</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white max-w-2xl">
                        Built on composable, production-grade infrastructure
                    </h2>
                    <p className="mt-4 text-zinc-400 text-base max-w-2xl">
                        Agents live on Base. Preferences live on ENS. Reports live encrypted. Intelligence is paid for on demand.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 relative">
                    {/* Connector line (desktop) */}
                    <div className="hidden md:block absolute top-[50%] left-[33%] right-[33%] h-px bg-gradient-to-r from-[#ff0033]/20 via-[#f59e0b]/20 to-[#3b82f6]/20" />

                    {layers.map((layer, i) => (
                        <motion.div
                            key={layer.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.15 }}
                            viewport={{ once: true }}
                            className="relative rounded-2xl border bg-[#0c0d12] p-6 overflow-hidden"
                            style={{ borderColor: layer.color + "22", boxShadow: `inset 0 0 40px ${layer.color}08` }}
                        >
                            {/* Top glow line */}
                            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${layer.color}66, transparent)` }} />

                            {/* Glow dot */}
                            <div className="flex items-center gap-2.5 mb-5">
                                <span className="w-2 h-2 rounded-full" style={{ background: layer.color, boxShadow: `0 0 8px ${layer.color}` }} />
                                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: layer.color }}>{layer.label}</p>
                            </div>

                            <div className="space-y-2.5">
                                {layer.items.map((item) => (
                                    <div key={item} className="flex items-center gap-2.5 p-3 rounded-xl border border-white/5 bg-white/2">
                                        <div className="w-1 h-4 rounded-full" style={{ backgroundColor: layer.color + "55" }} />
                                        <p className="text-zinc-300 text-sm">{item}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Corner glow */}
                            <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full blur-[50px] opacity-10 pointer-events-none" style={{ background: layer.color }} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
