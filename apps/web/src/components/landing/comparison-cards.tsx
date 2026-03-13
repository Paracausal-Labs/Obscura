"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const rows = [
  { feature: "Agent Model", obscura: "Specialized roles: Scout, Analyst, Ghost, Sentinel", agentropolis: "General-purpose, prompt-driven" },
  { feature: "User Interaction", obscura: "Job posting via policy contract \u2014 no direct wallet exposure", agentropolis: "Direct user wallet interaction" },
  { feature: "Privacy", obscura: "Intermediary-isolated execution, Fileverse-encrypted reports", agentropolis: "Public on-chain user activity" },
  { feature: "Economy", obscura: "ERC-8183 escrow, x402 micropayments, per-job billing", agentropolis: "Token-gated participation" },
  { feature: "Execution Model", obscura: "Multi-step pipeline: research \u2192 execute \u2192 evaluate \u2192 settle", agentropolis: "Single-shot prompt execution" },
];

export function ComparisonCards() {
  return (
    <section className="relative w-full py-24 md:py-32 bg-[#07080a] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full blur-[120px] opacity-[0.05] pointer-events-none"
        style={{ background: "#ff0033" }}
      />
      <div className="absolute top-0 left-[5%] w-[500px] h-[400px] rounded-full blur-[160px] opacity-[0.04] pointer-events-none bg-zinc-300" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[#ff0033] uppercase tracking-widest text-[11px] font-semibold mb-3">
            Comparison
          </p>
          <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">
            Built differently, by design
          </h2>
        </motion.div>

        <div className="relative rounded-[2rem] border border-[#ff0033]/[0.12] bg-[#0c0d12] p-5 md:p-6 overflow-hidden shadow-[0_0_0_1px_rgba(255,0,51,0.08),inset_0_0_60px_rgba(255,0,51,0.03)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[120px] rounded-full blur-[70px] opacity-[0.04] pointer-events-none bg-white" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative rounded-2xl border border-[#ff0033]/[0.15] bg-[#0a0b0f] overflow-hidden"
              style={{ boxShadow: "inset 0 0 50px rgba(255,0,51,0.04)" }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/50 to-transparent" />
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/5">
                <span
                  className="w-2.5 h-2.5 rounded-full bg-[#ff0033]"
                  style={{ boxShadow: "0 0 8px #ff0033" }}
                />
                <h3 className="text-white font-semibold text-base">Obscura</h3>
                <span className="ml-auto px-2.5 py-0.5 rounded-full bg-[#ff0033]/10 border border-[#ff0033]/[0.15] text-[#ff0033] text-[9px] font-semibold uppercase tracking-wider">
                  Private Execution
                </span>
              </div>
              <div className="p-3 space-y-2">
                {rows.map((row, i) => (
                  <motion.div
                    key={row.feature}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#ff0033]/[0.15] transition-colors"
                  >
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#ff0033]/10 flex items-center justify-center mt-0.5">
                      <Check size={9} className="text-[#ff0033]" />
                    </span>
                    <div>
                      <p className="text-zinc-600 text-[9px] uppercase tracking-widest font-semibold mb-0.5">
                        {row.feature}
                      </p>
                      <p className="text-white text-xs">{row.obscura}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative rounded-2xl border border-white/5 bg-[#090a0d] overflow-hidden"
            >
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <h3 className="text-zinc-500 font-semibold text-base">
                  Agentropolis
                </h3>
                <span className="ml-auto px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-zinc-600 text-[9px] font-semibold uppercase tracking-wider">
                  General Purpose
                </span>
              </div>
              <div className="p-3 space-y-2">
                {rows.map((row, i) => (
                  <motion.div
                    key={row.feature}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.04]"
                  >
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-white/[0.04] flex items-center justify-center mt-0.5">
                      <X size={9} className="text-zinc-600" />
                    </span>
                    <div>
                      <p className="text-zinc-700 text-[9px] uppercase tracking-widest font-semibold mb-0.5">
                        {row.feature}
                      </p>
                      <p className="text-zinc-500 text-xs">
                        {row.agentropolis}
                      </p>
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
