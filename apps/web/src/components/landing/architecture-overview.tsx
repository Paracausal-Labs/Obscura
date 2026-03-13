"use client";

import { motion } from "framer-motion";

const layers = [
  {
    id: "onchain",
    label: "Onchain",
    color: "#ff0033",
    items: ["Base Sepolia", "AgentJobs Contract", "ERC-8183 Escrow", "ERC-8004 Reputation"],
  },
  {
    id: "identity",
    label: "Identity & Policy",
    color: "#cccccc",
    items: ["ENS Names", "ENSIP-25 Preferences", "Risk Parameters", "Kill Switch"],
  },
  {
    id: "offchain",
    label: "Offchain Infrastructure",
    color: "#888888",
    items: ["Groq LLM Inference", "HeyElsa Research", "AgentCash x402", "BitGo Custody", "Fileverse Encryption"],
  },
];

export function ArchitectureOverview() {
  return (
    <section
      id="architecture"
      className="relative w-full py-24 md:py-32 bg-[#07080a] overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div
        className="absolute top-[20%] left-[0%] w-[400px] h-[500px] rounded-full blur-[140px] opacity-[0.05] pointer-events-none"
        style={{ background: "#ff0033" }}
      />
      <div className="absolute top-0 right-[5%] w-[600px] h-[400px] rounded-full blur-[160px] opacity-[0.05] pointer-events-none bg-zinc-300" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[#ff0033] uppercase tracking-widest text-[11px] font-semibold mb-3">
            Architecture
          </p>
          <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">
            Built on composable infrastructure
          </h2>
          <p className="text-zinc-500 text-base mt-4 max-w-2xl mx-auto">
            Agents live on Base. Preferences live on ENS. Reports live
            encrypted. Intelligence is paid for on demand.
          </p>
        </motion.div>

        <div className="relative rounded-[2rem] border border-[#ff0033]/[0.12] bg-[#0c0d12] p-5 md:p-6 overflow-hidden shadow-[0_0_0_1px_rgba(255,0,51,0.08),inset_0_0_60px_rgba(255,0,51,0.03)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[180px] rounded-full blur-[80px] opacity-[0.04] pointer-events-none bg-white" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
            {layers.map((layer, i) => (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                viewport={{ once: true }}
                className="relative rounded-2xl border bg-[#0a0b0f] p-5 overflow-hidden hover:bg-white/[0.01] transition-colors"
                style={{ borderColor: layer.color + "20" }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background: `linear-gradient(to right, transparent, ${layer.color}60, transparent)`,
                  }}
                />
                <div
                  className="absolute bottom-0 right-0 w-24 h-24 rounded-full blur-[50px] opacity-[0.08] pointer-events-none"
                  style={{ background: layer.color }}
                />

                <div className="flex items-center gap-2 mb-5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: layer.color,
                      boxShadow: `0 0 8px ${layer.color}`,
                    }}
                  />
                  <p
                    className="text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: layer.color }}
                  >
                    {layer.label}
                  </p>
                </div>

                <div className="space-y-2">
                  {layer.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/[0.08] transition-colors"
                    >
                      <div
                        className="w-0.5 h-4 rounded-full flex-shrink-0"
                        style={{ background: layer.color + "60" }}
                      />
                      <p className="text-zinc-400 text-xs">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
