"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const metrics = [
    { value: 47, label: "Jobs Completed", sub: "ERC-8183 settled", chart: [20, 32, 28, 45, 38, 47], span: "col-span-2" },
    { value: 92, suffix: "%", label: "Evaluator Approval", sub: "ERC-8004 scored", chart: [70, 80, 75, 88, 85, 92], span: "col-span-1" },
    { value: 0, label: "EOA → DEX Events", sub: "BitGo policy gated", chart: [3, 2, 1, 1, 0, 0], span: "col-span-1" },
    { value: 31, label: "Encrypted Reports", sub: "Fileverse encrypted", chart: [5, 10, 14, 20, 26, 31], span: "col-span-1" },
    { value: 4, label: "Live Agents", sub: "Scout · Analyst · Ghost · Sentinel", chart: [1, 1, 2, 2, 3, 4], span: "col-span-1 row-span-2" },
    { value: 0.05, prefix: "$", suffix: "–$0.13", label: "Avg Job Cost", sub: "Cross-agent average", chart: [12, 8, 9, 7, 6, 5], span: "col-span-2" },
];

function MiniBar({ data }: { data: number[] }) {
    const max = Math.max(...data) || 1;
    return (
        <div className="flex items-end gap-0.5 h-8">
            {data.map((v, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{ height: `${(v / max) * 100}%`, background: i === data.length - 1 ? "#ff0033" : "#ff003340" }} />
            ))}
        </div>
    );
}

function Counter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const dur = 1200;
        const step = to / (dur / 16);
        const t = setInterval(() => {
            start = Math.min(start + step, to);
            setCount(parseFloat(start.toFixed(to < 1 ? 2 : 0)));
            if (start >= to) clearInterval(t);
        }, 16);
        return () => clearInterval(t);
    }, [inView, to]);
    return <span ref={ref}>{prefix}{count}{to === 0.05 ? "" : suffix}</span>;
}

export function MetricsMosaic() {
    return (
        <section className="relative w-full py-24 md:py-32 bg-[#07080a] overflow-hidden">
            {/* Ambient glows — red + silver */}
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] rounded-full blur-[120px] opacity-[0.06] pointer-events-none" style={{ background: "#ff0033" }} />
            <div className="absolute top-[10%] right-[5%] w-[600px] h-[400px] rounded-full blur-[160px] opacity-[0.05] pointer-events-none bg-zinc-300" />
            <div className="absolute bottom-[20%] left-0 w-[400px] h-[300px] rounded-full blur-[130px] opacity-[0.03] pointer-events-none bg-zinc-100" />

            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                {/* Centred heading */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }} viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <p className="text-[#ff0033] uppercase tracking-widest text-[11px] font-semibold mb-3">By the numbers</p>
                    <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">Meet marvellous metrics</h2>
                    <p className="text-zinc-500 text-base mt-4 max-w-md mx-auto">Real data from live agents running on the Obscura network</p>
                </motion.div>

                {/* Mosaic — large rounded outer container like reference */}
                <div className="relative rounded-[2rem] border border-[#ff0033]/12 bg-[#0c0d12] p-5 md:p-6 overflow-hidden shadow-[0_0_0_1px_rgba(255,0,51,0.08),inset_0_0_60px_rgba(255,0,51,0.03)]">
                    {/* Inner spotlight */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[180px] rounded-full blur-[80px] opacity-[0.05] pointer-events-none bg-white" />

                    <div className="grid grid-cols-3 gap-3">
                        {metrics.map((m, i) => (
                            <motion.div
                                key={m.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.07 }}
                                viewport={{ once: true }}
                                className={`relative rounded-2xl border border-white/6 bg-[#0a0b0f] p-5 overflow-hidden flex flex-col justify-between min-h-[140px] group hover:border-white/12 transition-colors ${m.span}`}
                            >
                                {/* Top accent */}
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
                                <div>
                                    <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-widest mb-2">{m.label}</p>
                                    <p className="text-white font-black text-4xl md:text-5xl leading-none tabular-nums">
                                        <Counter to={m.value} prefix={m.prefix ?? ""} suffix={m.suffix ?? ""} />
                                        {m.value === 0.05 && <span className="text-zinc-500 text-xl font-medium ml-0.5">–$0.13</span>}
                                    </p>
                                    <p className="text-zinc-700 text-[10px] mt-2">{m.sub}</p>
                                </div>
                                <MiniBar data={m.chart} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
