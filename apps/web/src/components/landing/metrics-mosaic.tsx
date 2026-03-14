"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const metrics = [
  { value: 47, label: "Jobs Completed", sub: "ERC-8183 settled", chart: [20, 32, 28, 45, 38, 47], span: "col-span-2" },
  { value: 92, suffix: "%", label: "Evaluator Approval", sub: "ERC-8004 scored", chart: [70, 80, 75, 88, 85, 92], span: "col-span-1" },
  { value: 0, label: "EOA \u2192 DEX Events", sub: "BitGo policy gated", chart: [3, 2, 1, 1, 0, 0], span: "col-span-1" },
  { value: 31, label: "Encrypted Reports", sub: "Fileverse encrypted", chart: [5, 10, 14, 20, 26, 31], span: "col-span-1" },
  { value: 4, label: "Live Agents", sub: "Scout \u00b7 Analyst \u00b7 Ghost \u00b7 Sentinel", chart: [1, 1, 2, 2, 3, 4], span: "col-span-1 row-span-2" },
  { value: 0.05, prefix: "$", suffix: "\u2013$0.13", label: "Avg Job Cost", sub: "Cross-agent average", chart: [12, 8, 9, 7, 6, 5], span: "col-span-2" },
];

function CylinderChart({ data }: { data: number[] }) {
  const max = Math.max(...data) || 1;
  return (
    <div className="flex items-end gap-1.5 h-12 mt-4 px-1">
      {data.map((v, i) => {
        const height = (v / max) * 100;
        const isLast = i === data.length - 1;
        return (
          <div key={i} className="group/bar relative flex-1 flex flex-col items-center justify-end h-full">
            {/* Cylinder Body */}
            <div 
              className="relative w-full rounded-full transition-all duration-700 ease-out overflow-hidden"
              style={{ 
                height: `${height}%`,
                background: isLast 
                  ? "linear-gradient(to top, #ff0033 0%, #ff1a40 50%, #ff6680 100%)" 
                  : "linear-gradient(to top, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 100%)",
                boxShadow: isLast ? "0 0 15px rgba(255,0,51,0.3)" : "none"
              }}
            >
              {/* Highlight Spot */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white opacity-40 blur-[1px]" />
              
              {/* Internal Glow */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300" />
            </div>
            
            {/* Base Glow */}
            <div className={`absolute -bottom-1 w-2 h-1 rounded-full blur-[2px] ${isLast ? "bg-[#ff0033]" : "bg-white/10"}`} />
          </div>
        );
      })}
    </div>
  );
}

function Counter({
  to,
  prefix = "",
  suffix = "",
}: {
  to: number;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const dur = 1500;
    const step = to / (dur / 16);
    const t = setInterval(() => {
      start = Math.min(start + step, to);
      setCount(parseFloat(start.toFixed(to < 1 ? 2 : 0)));
      if (start >= to) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [inView, to]);
  return (
    <span ref={ref} className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
      {prefix}
      {count}
      {to === 0.05 ? "" : suffix}
    </span>
  );
}

export function MetricsMosaic() {
  return (
    <section className="relative w-full py-24 md:py-32 bg-[#050608] overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
         {/* Silver/White Central Ambient Glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] opacity-80" />
         
         {/* Subtle Top Accent */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6">
            <span className="w-1 h-px bg-[#ff0033]" />
            <p className="text-[#ff0033] uppercase tracking-[0.4em] text-[8px] font-bold">
              GET STARTED
            </p>
            <span className="w-1 h-px bg-[#ff0033]" />
          </div>
          <h2 className="text-5xl md:text-7xl font-extralight text-white tracking-tight mb-6 leading-[1.1]">
            Meet marvelous <span className="text-zinc-500">metrics.</span>
          </h2>
          <p className="text-zinc-500 text-base max-w-lg mx-auto font-light tracking-wide">
            Obscura is the product layer for autonomous DeFi agents. Illustrative metrics from the protocol design.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              viewport={{ once: true }}
              className={`relative rounded-3xl bg-white/[0.01] backdrop-blur-3xl p-8 overflow-hidden group hover:bg-white/[0.02] transition-all duration-700 border border-white/[0.04] hover:border-white/[0.08] ${m.span}`}
            >
              {/* Silver edge highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-[0.25em]">
                      {m.label}
                    </p>
                  </div>
                  
                  <div className="flex items-baseline gap-1 mt-1">
                    <p className="text-white font-extralight text-5xl md:text-7xl tracking-tighter tabular-nums leading-none">
                      <Counter
                        to={m.value}
                        prefix={m.prefix ?? ""}
                        suffix={m.suffix ?? ""}
                      />
                      {m.value === 0.05 && (
                        <span className="text-zinc-600 text-xl font-light ml-2">
                          {"\u2013"}$0.13
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-zinc-700 text-[10px] font-mono mt-4 uppercase tracking-widest leading-none border-l border-white/10 pl-3">
                    {m.sub}
                  </p>
                </div>

                <div className="mt-10">
                   <CylinderChart data={m.chart} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Decorative Grid Pattern Bottom */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      </div>
    </section>
  );
}
