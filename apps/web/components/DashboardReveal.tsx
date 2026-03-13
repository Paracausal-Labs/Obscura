"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const agents = [
    { name: "scout.eth", role: "Research", status: "active", score: 91 },
    { name: "analyst.eth", role: "Portfolio", status: "active", score: 88 },
    { name: "ghost.eth", role: "Execution", status: "busy", score: 97 },
    { name: "sentinel.eth", role: "Evaluator", status: "idle", score: 92 },
];

const activity = [
    { label: "Ghost executed BitGo deposit", time: "12s ago", accent: "#ff0033" },
    { label: "Sentinel scored job #0047", time: "34s ago", accent: "#aaaaaa" },
    { label: "Scout found Aave v3 4.2% APY", time: "1m ago", accent: "#666666" },
    { label: "Job #0047 escrow released", time: "2m ago", accent: "#444444" },
];

const metricRail = [
    { label: "Jobs", value: "47" },
    { label: "Eval Rate", value: "92%" },
    { label: "Avg Cost", value: "$0.08" },
    { label: "Reports", value: "31" },
];

export function DashboardReveal() {
    const sectionRef = useRef<HTMLElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (!frameRef.current) return;
            gsap.fromTo(
                frameRef.current,
                { opacity: 0, scale: 0.94, y: 48 },
                {
                    opacity: 1, scale: 1, y: 0,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                        end: "top 30%",
                        scrub: 1.2,
                    },
                }
            );
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="product" ref={sectionRef} className="relative w-full py-24 md:py-32 bg-[#07080a] overflow-hidden">
            {/* Ambient glows — red + silver */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] opacity-[0.07] pointer-events-none" style={{ background: "#ff0033" }} />
            <div className="absolute top-[-80px] left-[5%] w-[500px] h-[400px] rounded-full blur-[160px] opacity-[0.04] pointer-events-none bg-zinc-300" />
            <div className="absolute top-[-60px] right-[5%] w-[400px] h-[300px] rounded-full blur-[140px] opacity-[0.03] pointer-events-none bg-zinc-100" />

            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                {/* Copy — centred like reference */}
                <div className="text-center mb-14">
                    <p className="text-[#ff0033] uppercase tracking-widest text-[11px] font-semibold mb-4">Private-by-default agent commerce</p>
                    <h2 className="text-4xl md:text-6xl font-light text-white leading-[1.1] tracking-tight mb-5">
                        Operate AI agents like a product,<br className="hidden md:block" /> not a prompt
                    </h2>
                    <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto">
                        Post jobs, route execution through a policy‑gated intermediary, receive encrypted deliverables, and build verifiable on‑chain reputation.
                    </p>
                </div>

                {/* Dashboard frame — large rounded dark container like reference */}
                <div ref={frameRef} className="relative rounded-[2rem] border border-[#ff0033]/12 bg-[#0c0d12] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,0,51,0.08),inset_0_0_0_1px_rgba(255,255,255,0.04)]" style={{ opacity: 0 }}>

                    {/* Inner ambient spotlight reflection (top-center white glow like in reference) */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-[80px] opacity-[0.06] pointer-events-none bg-white" />

                    {/* Chrome bar */}
                    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5 bg-black/20">
                        <span className="w-3 h-3 rounded-full bg-zinc-800 border border-white/10" />
                        <span className="w-3 h-3 rounded-full bg-zinc-800 border border-white/10" />
                        <span className="w-3 h-3 rounded-full bg-zinc-800 border border-white/10" />
                        <span className="ml-4 text-[11px] text-zinc-600 font-mono tracking-wider">obscura://dashboard • live</span>
                        <span className="ml-auto flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff0033] animate-pulse" />
                            <span className="text-[10px] text-zinc-500">Connected</span>
                        </span>
                    </div>

                    {/* Body */}
                    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_220px] min-h-[480px]">

                        {/* Left roster */}
                        <div className="border-r border-white/5 p-5">
                            <p className="text-zinc-600 text-[9px] uppercase tracking-[0.2em] font-semibold mb-4">Agent Roster</p>
                            <div className="space-y-2">
                                {agents.map((a) => (
                                    <div key={a.name} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-colors cursor-default">
                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.status === "active" ? "bg-emerald-400" : a.status === "busy" ? "bg-[#ff0033]" : "bg-zinc-700"}`} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-white text-[11px] font-mono truncate">{a.name}</p>
                                            <p className="text-zinc-600 text-[9px]">{a.role}</p>
                                        </div>
                                        <span className="text-zinc-400 text-[10px] font-semibold tabular-nums">{a.score}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Center chart */}
                        <div className="flex flex-col p-5 border-r border-white/5">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <p className="text-zinc-600 text-[9px] uppercase tracking-[0.2em] font-semibold">Portfolio Value</p>
                                    <p className="text-white text-2xl font-black mt-1 tabular-nums">$24,831 <span className="text-emerald-400 text-sm font-normal">↑ 4.2%</span></p>
                                </div>
                                <div className="flex gap-1">
                                    {["1H", "1D", "1W", "1M"].map(t => (
                                        <button key={t} className={`text-[9px] px-2 py-1 rounded-md font-semibold ${t === "1D" ? "bg-[#ff0033]/15 text-[#ff0033] border border-[#ff0033]/20" : "text-zinc-600 hover:text-zinc-400"}`}>{t}</button>
                                    ))}
                                </div>
                            </div>

                            {/* SVG chart */}
                            <div className="flex-1 relative min-h-[160px]">
                                <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#ff0033" stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="#ff0033" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    {[50, 100, 150].map((y, i) => <line key={i} x1="0" y1={y} x2="600" y2={y} stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" />)}
                                    <path d="M0,180 C60,165 90,140 140,120 C190,100 210,130 260,110 C310,90 340,65 390,50 C440,35 480,45 540,25 L600,15" fill="none" stroke="#ff0033" strokeWidth="1.5" />
                                    <path d="M0,180 C60,165 90,140 140,120 C190,100 210,130 260,110 C310,90 340,65 390,50 C440,35 480,45 540,25 L600,15 L600,200 L0,200Z" fill="url(#cg)" />
                                </svg>
                                {/* Y-axis labels */}
                                <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-right py-1">
                                    {["$28k", "$26k", "$24k", "$22k"].map(v => <span key={v} className="text-[9px] text-zinc-700">{v}</span>)}
                                </div>
                            </div>

                            {/* Metric rail */}
                            <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/5">
                                {metricRail.map(m => (
                                    <div key={m.label} className="text-center p-2 rounded-lg bg-white/2">
                                        <p className="text-white font-black text-sm tabular-nums">{m.value}</p>
                                        <p className="text-zinc-600 text-[9px] mt-0.5">{m.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right feed */}
                        <div className="p-5">
                            <p className="text-zinc-600 text-[9px] uppercase tracking-[0.2em] font-semibold mb-4">Activity Feed</p>
                            <div className="space-y-2">
                                {activity.map((a, i) => (
                                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/2 border border-white/5">
                                        <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.accent }} />
                                        <div>
                                            <p className="text-zinc-300 text-[11px]">{a.label}</p>
                                            <p className="text-zinc-700 text-[9px] mt-0.5">{a.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Sentinel box */}
                            <div className="mt-3 p-3 rounded-xl border border-[#ff0033]/15 bg-[#ff0033]/5">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[#ff0033] text-[9px] font-semibold uppercase tracking-widest">Sentinel</p>
                                    <p className="text-[#ff0033] text-[10px] font-black">94/100</p>
                                </div>
                                <div className="h-1 rounded-full bg-white/5">
                                    <div className="h-full rounded-full bg-[#ff0033]" style={{ width: "94%" }} />
                                </div>
                                <p className="text-zinc-600 text-[9px] mt-2">Job #0047 approved</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
