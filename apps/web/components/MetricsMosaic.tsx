"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const metrics = [
    {
        value: 47,
        suffix: "",
        label: "Jobs Completed",
        sub: "ERC-8183 settled",
        size: "large",
        chart: [20, 32, 28, 45, 38, 47],
    },
    {
        value: 92,
        suffix: "%",
        label: "Evaluator Approval Rate",
        sub: "ERC-8004 scored",
        size: "normal",
        chart: [70, 80, 75, 88, 85, 92],
    },
    {
        value: 31,
        suffix: "",
        label: "Encrypted Reports Delivered",
        sub: "Fileverse encrypted",
        size: "normal",
        chart: [5, 10, 14, 20, 26, 31],
    },
    {
        value: 0,
        suffix: "",
        label: "Direct EOA → DEX Interactions",
        sub: "BitGo policy gated",
        size: "wide",
        chart: [3, 2, 1, 1, 0, 0],
    },
    {
        value: 0.05,
        prefix: "$",
        suffix: "–$0.13",
        label: "Average Job Cost",
        sub: "Cross-agent average",
        size: "normal",
        chart: [12, 8, 9, 7, 6, 5],
    },
    {
        value: 4,
        suffix: "",
        label: "Live Agents on Network",
        sub: "Scout · Analyst · Ghost · Sentinel",
        size: "normal",
        chart: [1, 1, 2, 2, 3, 4],
    },
];

function MiniBar({ data }: { data: number[] }) {
    const max = Math.max(...data);
    return (
        <div className="flex items-end gap-0.5 h-8">
            {data.map((v, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-sm bg-[#ff0033]/40"
                    style={{ height: `${(v / max) * 100}%` }}
                />
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
        const duration = 1400;
        const step = to / (duration / 16);
        const timer = setInterval(() => {
            start = Math.min(start + step, to);
            setCount(parseFloat(start.toFixed(to < 1 ? 2 : 0)));
            if (start >= to) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [inView, to]);

    return (
        <span ref={ref}>
            {prefix}{count}{suffix}
        </span>
    );
}

export function MetricsMosaic() {
    return (
        <section className="relative w-full py-24 bg-[#07080a]">
            <div className="max-w-[1600px] mx-auto px-6 md:px-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-14"
                >
                    <p className="text-[#ff0033] uppercase tracking-widest text-xs font-semibold mb-3">By the numbers</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Live product metrics</h2>
                </motion.div>

                {/* Mosaic grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[180px]">

                    {/* Card 1 - large (spans 2 cols) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.0 }}
                        viewport={{ once: true }}
                        className="col-span-2 row-span-1 relative rounded-2xl border border-white/8 bg-[#0c0d12] p-6 overflow-hidden flex flex-col justify-between group"
                        style={{ boxShadow: "inset 0 0 40px rgba(255,0,51,0.04)" }}
                    >
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
                        <div>
                            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">{metrics[0].label}</p>
                            <p className="text-5xl font-black text-white mt-2">
                                <Counter to={metrics[0].value} />
                            </p>
                            <p className="text-zinc-600 text-xs mt-2">{metrics[0].sub}</p>
                        </div>
                        <MiniBar data={metrics[0].chart} />
                    </motion.div>

                    {/* Cards 2,3,4,5,6 */}
                    {metrics.slice(1).map((m, i) => (
                        <motion.div
                            key={m.label}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: (i + 1) * 0.08 }}
                            viewport={{ once: true }}
                            className={`relative rounded-2xl border border-white/8 bg-[#0c0d12] p-6 overflow-hidden flex flex-col justify-between group ${m.size === "wide" ? "col-span-2" : "col-span-1"}`}
                            style={{ boxShadow: "inset 0 0 30px rgba(255,0,51,0.03)" }}
                        >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            <div>
                                <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest mb-1">{m.label}</p>
                                <p className="text-3xl md:text-4xl font-black text-white mt-1">
                                    {m.prefix && m.prefix}
                                    <Counter to={m.value} prefix="" suffix={m.value === 0.05 ? "" : m.suffix} />
                                    {m.value === 0.05 && <span className="text-zinc-500 text-xl font-medium">–$0.13</span>}
                                </p>
                                <p className="text-zinc-600 text-[10px] mt-2">{m.sub}</p>
                            </div>
                            <MiniBar data={m.chart} />
                        </motion.div>
                    ))}

                </div>
            </div>
        </section>
    );
}
