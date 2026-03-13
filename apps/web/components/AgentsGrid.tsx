"use client";

import { motion } from "framer-motion";

const agents = [
    {
        ens: "scout.eth", name: "Scout", role: "Research & Discovery",
        description: "Scans DeFi protocols, aggregates yield opportunities, and delivers structured signal reports. Powered by Groq and HeyElsa.",
        capabilities: ["Yield research", "Sentiment analysis", "Protocol monitoring"],
        fee: "0.05 USDC", success: 91, avgTime: "45s",
        bars: [75, 82, 79, 88, 91, 91], color: "#aaaaaa",
    },
    {
        ens: "analyst.eth", name: "Analyst", role: "Portfolio & P&L",
        description: "Constructs portfolio snapshots, performs wallet-level attribution, and surfaces P&L breakdowns with verifiable ERC-8004 sourcing.",
        capabilities: ["Portfolio tracking", "Wallet attribution", "Risk scoring"],
        fee: "0.07 USDC", success: 88, avgTime: "52s",
        bars: [60, 72, 80, 84, 85, 88], color: "#888888",
    },
    {
        ens: "ghost.eth", name: "Ghost", role: "Private Execution",
        description: "Executes strategy through a BitGo-managed intermediary wallet. No direct EOA → DEX path. Maximum privacy, full compliance.",
        capabilities: ["BitGo execution", "Wallet isolation", "Policy enforcement"],
        fee: "0.10 USDC", success: 97, avgTime: "30s",
        bars: [88, 92, 93, 95, 96, 97], color: "#ff0033",
    },
    {
        ens: "sentinel.eth", name: "Sentinel", role: "Evaluator & Policy Engine",
        description: "Scores deliverables against policy criteria using ERC-8004. Issues approval signals and triggers escrow settlement or dispute.",
        capabilities: ["Deliverable scoring", "Policy evaluation", "Escrow control"],
        fee: "—", success: 92, avgTime: "18s eval",
        bars: [80, 84, 88, 90, 91, 92], color: "#cccccc",
    },
];

function Sparkbar({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data);
    return (
        <div className="flex items-end gap-0.5 h-6">
            {data.map((v, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{ height: `${(v / max) * 100}%`, background: i === data.length - 1 ? color : color + "44" }} />
            ))}
        </div>
    );
}

export function AgentsGrid() {
    return (
        <section className="relative w-full py-24 md:py-32 bg-[#07080a] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
            {/* Ambient glows — red + silver */}
            <div className="absolute right-0 top-1/3 w-[400px] h-[500px] rounded-full blur-[130px] opacity-[0.05] pointer-events-none" style={{ background: "#ff0033" }} />
            <div className="absolute left-0 top-1/2 w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.04] pointer-events-none bg-zinc-300" />
            <div className="absolute left-[10%] bottom-0 w-[400px] h-[300px] rounded-full blur-[130px] opacity-[0.03] pointer-events-none bg-zinc-100" />

            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }} viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <p className="text-[#ff0033] uppercase tracking-widest text-[11px] font-semibold mb-3">Agent roster</p>
                    <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">Four agents. One pipeline.</h2>
                    <p className="text-zinc-500 text-base mt-4 max-w-lg mx-auto">Each agent is a specialized capability module with its own ENS identity, policy rules, and verifiable track record.</p>
                </motion.div>

                {/* Outer container */}
                <div className="relative rounded-[2rem] border border-[#ff0033]/12 bg-[#0c0d12] p-5 md:p-6 overflow-hidden shadow-[0_0_0_1px_rgba(255,0,51,0.08),inset_0_0_60px_rgba(255,0,51,0.03)]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[180px] rounded-full blur-[80px] opacity-[0.04] pointer-events-none bg-white" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {agents.map((agent, i) => (
                            <motion.div
                                key={agent.ens}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="relative rounded-2xl border border-white/5 bg-[#0a0b0f] p-6 overflow-hidden hover:border-white/10 transition-all duration-300 group"
                            >
                                <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${agent.color}55, transparent)` }} />
                                <div className="absolute bottom-0 right-0 w-28 h-28 rounded-full blur-[60px] opacity-10 pointer-events-none" style={{ background: agent.color }} />

                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-zinc-600 text-[9px] font-mono mb-1">{agent.ens}</p>
                                        <h3 className="text-white font-semibold text-lg">{agent.name}</h3>
                                        <p className="text-zinc-500 text-xs mt-0.5">{agent.role}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-zinc-600 text-[9px] uppercase tracking-widest mb-1">Success</p>
                                        <p className="font-black text-2xl tabular-nums" style={{ color: agent.color }}>{agent.success}%</p>
                                    </div>
                                </div>

                                <p className="text-zinc-500 text-xs leading-relaxed mb-4">{agent.description}</p>

                                <div className="flex flex-wrap gap-1.5 mb-5">
                                    {agent.capabilities.map((c) => (
                                        <span key={c} className="px-2.5 py-1 rounded-lg border border-white/6 bg-white/2 text-zinc-500 text-[10px]">{c}</span>
                                    ))}
                                </div>

                                <div className="flex items-end justify-between gap-3 pt-4 border-t border-white/5">
                                    <div className="flex gap-5">
                                        <div>
                                            <p className="text-zinc-700 text-[9px] uppercase tracking-wider">Avg Time</p>
                                            <p className="text-white font-semibold text-xs mt-0.5">{agent.avgTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-zinc-700 text-[9px] uppercase tracking-wider">Fee</p>
                                            <p className="text-white font-semibold text-xs mt-0.5">{agent.fee}</p>
                                        </div>
                                    </div>
                                    <div className="w-20 flex-shrink-0">
                                        <Sparkbar data={agent.bars} color={agent.color} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
