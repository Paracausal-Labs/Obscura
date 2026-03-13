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
    { label: "Ghost executed BitGo deposit", time: "12s ago", color: "text-emerald-400" },
    { label: "Sentinel scored job #0047", time: "34s ago", color: "text-blue-400" },
    { label: "Scout found Aave v3 4.2% APY", time: "1m ago", color: "text-zinc-400" },
    { label: "Fileverse report encrypted", time: "2m ago", color: "text-zinc-500" },
    { label: "Job #0047 escrow released", time: "2m ago", color: "text-zinc-500" },
];

const metrics = [
    { label: "Jobs", value: "47" },
    { label: "Eval Rate", value: "92%" },
    { label: "Avg Cost", value: "$0.08" },
    { label: "Reports", value: "31" },
];

// Simple inline sparkline drawn with SVG
function Sparkline({ up }: { up: boolean }) {
    const path = up
        ? "M0,20 C15,18 25,10 40,8 C55,6 65,4 80,2"
        : "M0,4 C15,6 25,12 40,14 C55,16 65,18 80,18";
    return (
        <svg viewBox="0 0 80 24" className="w-16 h-5" fill="none">
            <path d={path} stroke={up ? "#22c55e" : "#ef4444"} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

export function DashboardReveal() {
    const sectionRef = useRef<HTMLElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (!frameRef.current || !contentRef.current) return;

            // Scale+fade in the dashboard frame as page enters section
            gsap.fromTo(
                frameRef.current,
                { opacity: 0, scale: 0.92, y: 40 },
                {
                    opacity: 1, scale: 1, y: 0, duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                        end: "top 25%",
                        scrub: 1,
                    },
                }
            );

            // Stagger inner elements in
            gsap.fromTo(
                contentRef.current.querySelectorAll(".dash-col"),
                { opacity: 0, y: 24 },
                {
                    opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 60%",
                        end: "top 20%",
                        scrub: 1,
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section id="product" ref={sectionRef} className="relative w-full py-24 md:py-32 bg-[#07080a] overflow-hidden">
            {/* Background noise / subtle grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: "repeating-linear-gradient(0deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 60px)" }}
            />

            {/* Copy */}
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 mb-12 md:mb-16">
                <p className="text-[#ff0033] uppercase tracking-widest text-xs font-semibold mb-4">
                    Private-by-default agent commerce
                </p>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl">
                    Operate AI agents like a product,<br className="hidden md:block" /> not a prompt
                </h2>
                <p className="mt-5 text-zinc-400 text-base md:text-lg max-w-2xl leading-relaxed">
                    Post jobs, route execution through a policy‑gated intermediary, receive encrypted deliverables, and build verifiable on-chain reputation.
                </p>
            </div>

            {/* Dashboard Frame */}
            <div ref={frameRef} className="max-w-[1600px] mx-auto px-4 md:px-8" style={{ opacity: 0 }}>
                <div className="relative rounded-2xl border border-white/8 bg-[#0c0d12] shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">

                    {/* Title bar */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0a0b0f]">
                        <span className="w-3 h-3 rounded-full bg-[#ff5f57]"></span>
                        <span className="w-3 h-3 rounded-full bg-[#febb2d]"></span>
                        <span className="w-3 h-3 rounded-full bg-[#28c840]"></span>
                        <span className="ml-4 text-xs text-zinc-500 font-mono">obscura://dashboard</span>
                    </div>

                    {/* Dashboard body */}
                    <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-[220px_1fr_240px] xl:grid-cols-[240px_1fr_260px] min-h-[500px] md:min-h-[560px]">

                        {/* Left: Agent Roster */}
                        <div className="dash-col border-r border-white/5 p-5 space-y-3">
                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-4">Agent Roster</p>
                            {agents.map((a) => (
                                <div key={a.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.status === "active" ? "bg-emerald-400" : a.status === "busy" ? "bg-amber-400" : "bg-zinc-600"}`} />
                                    <div className="min-w-0">
                                        <p className="text-white text-xs font-mono truncate">{a.name}</p>
                                        <p className="text-zinc-500 text-[10px]">{a.role}</p>
                                    </div>
                                    <span className="ml-auto text-zinc-400 text-[11px] font-semibold">{a.score}%</span>
                                </div>
                            ))}
                        </div>

                        {/* Center: Chart mock */}
                        <div className="dash-col flex flex-col p-5 border-r border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold">Portfolio Value</p>
                                    <p className="text-white text-2xl font-bold mt-1">$24,831 <span className="text-emerald-400 text-sm font-normal">+4.2%</span></p>
                                </div>
                                <div className="flex gap-2">
                                    {["1H", "1D", "1W", "1M"].map(t => (
                                        <button key={t} className={`text-[10px] px-2.5 py-1 rounded-md font-medium ${t === "1D" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>{t}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Fake chart area using SVG */}
                            <div className="flex-1 min-h-[200px] relative">
                                <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#ff0033" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#ff0033" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M0,180 C60,170 80,150 120,130 C160,110 180,140 220,120 C260,100 280,80 320,70 C360,60 380,90 420,60 C460,30 500,40 540,20 L600,10"
                                        fill="none" stroke="#ff0033" strokeWidth="1.5"
                                    />
                                    <path
                                        d="M0,180 C60,170 80,150 120,130 C160,110 180,140 220,120 C260,100 280,80 320,70 C360,60 380,90 420,60 C460,30 500,40 540,20 L600,10 L600,200 L0,200 Z"
                                        fill="url(#chartGrad)"
                                    />
                                    {/* X-axis lines */}
                                    {[40, 80, 120, 160].map((y, i) => (
                                        <line key={i} x1="0" y1={y} x2="600" y2={y} stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" />
                                    ))}
                                </svg>
                                {/* Y labels */}
                                <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-right pr-1 py-1">
                                    {["$28k", "$26k", "$24k", "$22k", "$20k"].map(v => (
                                        <span key={v} className="text-[9px] text-zinc-600">{v}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom metric rail */}
                            <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/5">
                                {metrics.map(m => (
                                    <div key={m.label} className="text-center">
                                        <p className="text-white font-bold text-base">{m.value}</p>
                                        <p className="text-zinc-500 text-[10px] mt-0.5">{m.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Activity Feed */}
                        <div className="dash-col p-5 space-y-3">
                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold mb-4">Activity Feed</p>
                            {activity.map((a, i) => (
                                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/2 border border-white/5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff0033] mt-1.5 flex-shrink-0" />
                                    <div>
                                        <p className={`text-xs ${a.color}`}>{a.label}</p>
                                        <p className="text-zinc-600 text-[10px] mt-0.5">{a.time}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-4 p-3 rounded-xl border border-[#ff0033]/20 bg-[#ff0033]/5">
                                <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-wider mb-1">Sentinel Status</p>
                                <p className="text-white text-xs">Job #0047 passed evaluation at score 94/100</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 rounded-full bg-white/5">
                                        <div className="h-full w-[94%] rounded-full bg-[#ff0033]" />
                                    </div>
                                    <span className="text-[#ff0033] text-[10px] font-bold">94</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
