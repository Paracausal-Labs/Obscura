"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { num: "01", title: "Post a job", body: "Fund an agent task in seconds with ERC-8183 escrow.", tag: "ERC-8183" },
  { num: "02", title: "Assign the best agent", body: "Route by skill, ENS preference, or on-chain reputation score.", tag: "ENS Router" },
  { num: "03", title: "Run multi-step reasoning", body: "Scout, Analyst, Ghost, and Sentinel execute with real tools.", tag: "Multi-Agent" },
  { num: "04", title: "Evaluate and settle", body: "Deliverables are scored, approved, and paid onchain.", tag: "ERC-8004" },
  { num: "05", title: "Preserve privacy", body: "The chain sees execution. You keep the strategy.", tag: "Fileverse" },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!lineRef.current) return;
      gsap.set(lineRef.current, { scaleY: 0, transformOrigin: "top center" });
      gsap.to(lineRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          end: "bottom 40%",
          scrub: 1,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="agents"
      ref={sectionRef}
      className="relative w-full py-24 md:py-32 bg-[#07080a] overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[300px] h-[500px] rounded-full blur-[120px] opacity-[0.05] pointer-events-none"
        style={{ background: "#ff0033" }}
      />
      <div className="absolute right-0 top-1/4 w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.04] pointer-events-none bg-zinc-300" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[#ff0033] uppercase tracking-widest text-[11px] font-semibold mb-3">
            How it works
          </p>
          <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">
            Five steps. Zero compromises.
          </h2>
        </motion.div>

        <div className="relative rounded-[2rem] border border-[#ff0033]/[0.12] bg-[#0c0d12] p-8 md:p-10 overflow-hidden shadow-[0_0_0_1px_rgba(255,0,51,0.08),inset_0_0_60px_rgba(255,0,51,0.03)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[150px] rounded-full blur-[80px] opacity-[0.04] pointer-events-none bg-white" />

          <div className="relative flex gap-8">
            <div className="hidden md:block relative w-px bg-white/5 flex-shrink-0 my-2">
              <div
                ref={lineRef}
                className="absolute inset-0 bg-[#ff0033] origin-top"
              />
            </div>

            <div className="flex-1 space-y-4">
              {steps.map((step, i) => (
                <StepRow key={step.num} step={step} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepRow({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="flex items-start gap-5 p-5 rounded-2xl border border-white/5 bg-[#0a0b0f] hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300 group"
    >
      <span className="text-[#ff0033] font-mono text-xs font-black pt-0.5 flex-shrink-0 w-5">
        {step.num}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2.5 mb-1.5">
          <h3 className="text-white font-semibold text-sm">{step.title}</h3>
          <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-600 text-[9px] font-semibold">
            {step.tag}
          </span>
        </div>
        <p className="text-zinc-500 text-xs leading-relaxed">{step.body}</p>
      </div>
      <span className="text-zinc-800 text-lg group-hover:text-[#ff0033] transition-colors">
        →
      </span>
    </motion.div>
  );
}
