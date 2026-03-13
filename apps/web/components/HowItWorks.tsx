"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
    {
        num: "01",
        title: "Post a job",
        body: "Fund an agent task in seconds with ERC-8183 escrow.",
        tag: "ERC-8183",
    },
    {
        num: "02",
        title: "Assign the best agent",
        body: "Route by skill, ENS preference, or on-chain reputation score.",
        tag: "ENS Router",
    },
    {
        num: "03",
        title: "Run multi-step reasoning",
        body: "Scout, Analyst, Ghost, and Sentinel execute with real tools.",
        tag: "Multi-Agent",
    },
    {
        num: "04",
        title: "Evaluate and settle",
        body: "Deliverables are scored, approved, and paid onchain.",
        tag: "ERC-8004",
    },
    {
        num: "05",
        title: "Preserve privacy",
        body: "The chain sees execution. You keep the strategy.",
        tag: "Fileverse",
    },
];

export function HowItWorks() {
    const sectionRef = useRef<HTMLElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (!lineRef.current) return;
            gsap.fromTo(
                lineRef.current,
                { scaleY: 0 },
                {
                    scaleY: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 70%",
                        end: "bottom 30%",
                        scrub: 1,
                    },
                }
            );
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="agents" ref={sectionRef} className="relative w-full py-24 md:py-32 bg-[#07080a]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

            <div className="max-w-[1600px] mx-auto px-6 md:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <p className="text-[#ff0033] uppercase tracking-widest text-xs font-semibold mb-3">How it works</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Five steps. Zero compromises.</h2>
                </motion.div>

                <div className="relative flex flex-col md:flex-row gap-0 md:gap-12">
                    {/* Vertical progress line (desktop) */}
                    <div className="hidden md:block absolute left-[28px] top-6 bottom-6 w-px bg-white/5 z-0">
                        <div
                            ref={lineRef}
                            className="w-full bg-[#ff0033] origin-top h-full"
                        />
                    </div>

                    <div className="flex flex-col gap-8 md:gap-0 pl-0 md:pl-16 w-full">
                        {steps.map((step, i) => (
                            <StepCard key={step.num} step={step} index={i} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative flex items-start gap-6 md:py-10 group"
        >
            {/* Step dot */}
            <div className="hidden md:flex absolute left-[-28px] translate-x-[-50%] w-7 h-7 rounded-full border border-white/10 bg-[#07080a] items-center justify-center flex-shrink-0 group-hover:border-[#ff0033]/50 transition-colors z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff0033]" />
            </div>

            <div className="flex-1 p-6 md:p-8 rounded-2xl border border-white/6 bg-[#0c0d12]/60 hover:border-white/12 hover:bg-[#0c0d12] transition-all duration-300"
                style={{ boxShadow: "inset 0 0 30px rgba(0,0,0,0.4)" }}
            >
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-[#ff0033] font-mono text-xs font-bold">{step.num}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/8 text-zinc-500 text-[10px] font-semibold">{step.tag}</span>
                </div>
                <h3 className="text-white text-lg md:text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.body}</p>
            </div>
        </motion.div>
    );
}
