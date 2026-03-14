"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const agents = [
  {
    ens: "scout.obscura.eth",
    name: "Scout",
    role: "Research & Discovery",
    class: "RECON",
    image: "/scout.png",
    description:
      "Scans DeFi protocols, aggregates yield opportunities, and delivers structured signal reports. Powered by Groq and HeyElsa.",
    capabilities: ["Yield research", "Sentiment analysis", "Protocol monitoring"],
    fee: "0.05 USDC",
    success: 91,
    avgTime: "45s",
    bars: [75, 82, 79, 88, 91, 91],
    color: "#aaaaaa",
    accentLight: "rgba(170,170,170,0.08)",
  },
  {
    ens: "analyst.obscura.eth",
    name: "Analyst",
    role: "Portfolio & P&L",
    class: "INTEL",
    image: "/analyst.png",
    description:
      "Constructs portfolio snapshots, performs wallet-level attribution, and surfaces P&L breakdowns with verifiable ERC-8004 sourcing.",
    capabilities: ["Portfolio tracking", "Wallet attribution", "Risk scoring"],
    fee: "0.07 USDC",
    success: 88,
    avgTime: "52s",
    bars: [60, 72, 80, 84, 85, 88],
    color: "#888888",
    accentLight: "rgba(136,136,136,0.08)",
  },
  {
    ens: "ghost.obscura.eth",
    name: "Ghost",
    role: "Private Execution",
    class: "STEALTH",
    image: "/ghost.png",
    description:
      "Executes strategy through a BitGo-managed intermediary wallet. No direct EOA to DEX path. Maximum privacy, full compliance.",
    capabilities: ["BitGo execution", "Wallet isolation", "Policy enforcement"],
    fee: "0.10 USDC",
    success: 97,
    avgTime: "30s",
    bars: [88, 92, 93, 95, 96, 97],
    color: "#ff0033",
    accentLight: "rgba(255,0,51,0.10)",
  },
  {
    ens: "sentinel.obscura.eth",
    name: "Sentinel",
    role: "Evaluator & Policy Engine",
    class: "ENFORCER",
    image: "/sentinel.png",
    description:
      "Scores deliverables against policy criteria using ERC-8004. Issues approval signals and triggers escrow settlement or dispute.",
    capabilities: ["Deliverable scoring", "Policy evaluation", "Escrow control"],
    fee: "—",
    success: 92,
    avgTime: "18s eval",
    bars: [80, 84, 88, 90, 91, 92],
    color: "#cccccc",
    accentLight: "rgba(204,204,204,0.08)",
  },
];

function Sparkbar({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-5">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${(v / max) * 100}%`,
            background: i === data.length - 1 ? color : color + "44",
          }}
        />
      ))}
    </div>
  );
}

export function AgentsGrid() {
  return (
    <section className="relative w-full py-24 md:py-32 bg-[#07080a] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div
        className="absolute right-0 top-1/3 w-[400px] h-[500px] rounded-full blur-[130px] opacity-[0.05] pointer-events-none"
        style={{ background: "#ff0033" }}
      />
      <div className="absolute left-0 top-1/2 w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.04] pointer-events-none bg-zinc-300" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[#ff0033] uppercase tracking-widest text-[11px] font-semibold mb-3">
            Agent roster
          </p>
          <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">
            Four agents. One pipeline.
          </h2>
          <p className="text-zinc-500 text-base mt-4 max-w-lg mx-auto">
            Each agent is a specialized capability module with its own ENS
            identity, policy rules, and verifiable track record.
          </p>
        </motion.div>

        <div className="relative rounded-[2rem] border border-[#ff0033]/[0.12] bg-[#0c0d12] p-5 md:p-6 overflow-hidden shadow-[0_0_0_1px_rgba(255,0,51,0.08),inset_0_0_60px_rgba(255,0,51,0.03)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[180px] rounded-full blur-[80px] opacity-[0.04] pointer-events-none bg-white" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.ens}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative rounded-2xl border border-white/5 bg-[#0a0b0f] overflow-hidden hover:border-white/10 transition-all duration-300 group flex flex-row min-h-[220px]"
              >
                {/* Top accent line */}
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background: `linear-gradient(to right, transparent, ${agent.color}55, transparent)`,
                  }}
                />

                {/* ──────── LEFT: character image ──────── */}
                <div
                  className="relative flex-shrink-0 w-[140px] md:w-[160px] flex items-end justify-center overflow-hidden"
                  style={{ background: agent.accentLight }}
                >
                  {/* vertical glow strip */}
                  <div
                    className="absolute inset-y-0 right-0 w-12 opacity-30 pointer-events-none"
                    style={{
                      background: `linear-gradient(to left, ${agent.color}33, transparent)`,
                    }}
                  />
                  {/* class badge */}
                  <span
                    className="absolute top-3 left-3 text-[8px] font-black tracking-[0.25em] px-1.5 py-0.5 rounded border"
                    style={{
                      color: agent.color,
                      borderColor: agent.color + "44",
                      background: agent.color + "11",
                    }}
                  >
                    {agent.class}
                  </span>

                  <Image
                    src={agent.image}
                    alt={agent.name}
                    width={160}
                    height={200}
                    className="object-contain object-bottom w-full h-full max-h-[220px] transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1"
                    style={{ filter: "drop-shadow(0 0 18px " + agent.color + "66)" }}
                  />

                  {/* bottom vertical separator */}
                  <div
                    className="absolute right-0 top-4 bottom-4 w-px"
                    style={{ background: `linear-gradient(to bottom, transparent, ${agent.color}33, transparent)` }}
                  />
                </div>

                {/* ──────── RIGHT: info ──────── */}
                <div className="flex-1 flex flex-col p-5 min-w-0">
                  {/* header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-zinc-600 text-[9px] font-mono mb-1">{agent.ens}</p>
                      <h3
                        className="font-black text-xl tracking-tight uppercase"
                        style={{
                          fontFamily: "Impact, 'Arial Black', sans-serif",
                          color: agent.color === "#ff0033" ? "#ff0033" : "#ffffff",
                        }}
                      >
                        {agent.name}
                      </h3>
                      <p className="text-zinc-500 text-[10px] mt-0.5">{agent.role}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-zinc-600 text-[9px] uppercase tracking-widest mb-0.5">Success</p>
                      <p className="font-black text-2xl tabular-nums" style={{ color: agent.color }}>
                        {agent.success}%
                      </p>
                    </div>
                  </div>

                  {/* description */}
                  <p className="text-zinc-500 text-[10px] leading-relaxed mb-3 flex-1">
                    {agent.description}
                  </p>

                  {/* capabilities */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {agent.capabilities.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-md border border-white/[0.06] bg-white/[0.02] text-zinc-500 text-[9px]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* footer stats */}
                  <div className="flex items-end justify-between gap-3 pt-3 border-t border-white/5">
                    <div className="flex gap-4">
                      <div>
                        <p className="text-zinc-700 text-[8px] uppercase tracking-wider">Avg Time</p>
                        <p className="text-white font-semibold text-xs mt-0.5">{agent.avgTime}</p>
                      </div>
                      <div>
                        <p className="text-zinc-700 text-[8px] uppercase tracking-wider">Fee</p>
                        <p className="text-white font-semibold text-xs mt-0.5">{agent.fee}</p>
                      </div>
                    </div>
                    <div className="w-16 flex-shrink-0">
                      <Sparkbar data={agent.bars} color={agent.color} />
                    </div>
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
