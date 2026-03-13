"use client";

import { motion } from "framer-motion";

const agents = [
    {
        ens: "scout.eth",
        name: "Scout",
        role: "Research & Discovery",
        description: "Scans DeFi protocols, aggregates yield opportunities, and delivers structured signal reports. Plugged into Groq and HeyElsa for real-time intelligence.",
        capabilities: ["Yield research", "Sentiment analysis", "Protocol monitoring"],
        fee: "0.05 USDC",
        success: 91,
        avgTime: "45s",
        bars: [75, 82, 79, 88, 91, 91],
        color: "#3b82f6",
    },
    {
        ens: "analyst.eth",
        name: "Analyst",
        role: "Portfolio & P&L",
        description: "Constructs portfolio snapshots, performs wallet-level attribution, and surfaces P&L breakdowns with verifiable on-chain sourcing via ERC-8004.",
        capabilities: ["Portfolio tracking", "Wallet attribution", "Risk scoring"],
        fee: "0.07 USDC",
        success: 88,
        avgTime: "52s",
        bars: [60, 72, 80, 84, 85, 88],
        color: "#a855f7",
    },
    {
        ens: "ghost.eth",
        name: "Ghost",
        role: "Private Execution",
        description: "Executes strategy through a BitGo-managed intermediary wallet. No direct EOA → DEX path. Maximum privacy, full policy compliance.",
        capabilities: ["BitGo execution", "Wallet isolation", "Policy enforcement"],
        fee: "0.10 USDC",
        success: 97,
        avgTime: "30s",
        bars: [88, 92, 93, 95, 96, 97],
        color: "#ff0033",
    },
    {
        ens: "sentinel.eth",
        name: "Sentinel",
        role: "Evaluator & Policy Engine",
        description: "Scores deliverables against policy criteria using ERC-8004. Issues approval signals and triggers escrow settlement or dispute resolution.",
        capabilities: ["Deliverable scoring", "Policy evaluation", "Escrow control"],
        fee: "—",
        success: 92,
        avgTime: "18s eval",
        bars: [80, 84, 88, 90, 91, 92],
        color: "#f59e0b",
    },
];

function Sparkbar({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data);
    return (
        <div className="flex items-end gap-0.5 h-7 mt-4">
            {data.map((v, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{ height: `${(v / max) * 100}%`, backgroundColor: color + "55" }}
                />
            ))}
        </div>
    );
}

export function AgentsGrid() {
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
                    <p className="text-[#ff0033] uppercase tracking-widest text-xs font-semibold mb-3">Agent roster</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Four agents. One pipeline.</h2>
                    <p className="mt-4 text-zinc-400 text-base max-w-xl">Each agent is a specialized capability module with its own ENS identity, policy rules, and verifiable track record.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {agents.map((agent, i) => (
                        <motion.div
                            key={agent.ens}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative rounded-2xl border border-white/8 bg-[#0c0d12] p-7 overflow-hidden hover:border-white/14 transition-all duration-300"
                            style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)" }}
                        >
                            {/* Top accent glow */}
                            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${agent.color}66, transparent)` }} />
                            {/* Corner glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-10 pointer-events-none" style={{ background: agent.color }} />

                            {/* Header */}
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <p className="text-xs font-mono text-zinc-500 mb-1">{agent.ens}</p>
                                    <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                                    <p className="text-xs text-zinc-500 mt-0.5">{agent.role}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Success Rate</p>
                                    <p className="text-2xl font-black" style={{ color: agent.color }}>{agent.success}%</p>
                                </div>
                            </div>

                            <p className="text-zinc-400 text-sm leading-relaxed mb-5">{agent.description}</p>

                            {/* Capabilities */}
                            <div className="flex flex-wrap gap-2 mb-5">
                                {agent.capabilities.map((c) => (
                                    <span key={c} className="px-3 py-1 rounded-lg border border-white/8 text-zinc-400 text-[11px] font-medium bg-white/3">
                                        {c}
                                    </span>
                                ))}
                            </div>

                            {/* Stats row */}
                            <div className="flex items-end justify-between gap-4 pt-4 border-t border-white/5">
                                <div className="flex gap-6">
                                    <div>
                                        <p className="text-zinc-600 text-[10px] uppercase tracking-widest">Avg Time</p>
                                        <p className="text-white font-semibold text-sm mt-0.5">{agent.avgTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-600 text-[10px] uppercase tracking-widest">Fee</p>
                                        <p className="text-white font-semibold text-sm mt-0.5">{agent.fee}</p>
                                    </div>
                                </div>
                                <div className="w-28">
                                    <Sparkbar data={agent.bars} color={agent.color} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
