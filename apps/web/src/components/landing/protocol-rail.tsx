"use client";

import React from "react";

const logos = [
  { name: "ENS", src: "/logos/ens.png", w: 100, h: 48, op: 0.7, forceWhite: true },
  { name: "BitGo", src: "/logos/bitgo.png", w: 130, h: 48, op: 0.7, forceWhite: true },
  { name: "HeyElsa", src: "/logos/heyelsa.png", w: 160, h: 52, op: 0.7, forceWhite: true },
  { name: "Fileverse", src: "/logos/fileverse.png", w: 120, h: 68, op: 0.5, forceWhite: false },
  { name: "Base", src: "/logos/base.png", w: 130, h: 66, op: 0.7, forceWhite: true },
  { name: "Groq", src: "/logos/groq.png", w: 140, h: 48, op: 0.5, forceWhite: false },
  { name: "AgentCash", src: null, w: 120, h: 48, op: 0.5, forceWhite: false },
];

export function ProtocolRail() {
  const doubled = [...logos, ...logos, ...logos, ...logos];

  return (
    <section className="relative w-full py-16 bg-[#07080a] border-t border-white/5 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 mb-10 flex flex-col items-center text-center">
        <p className="text-zinc-500 tracking-widest text-[10px] font-semibold uppercase mb-3">
          Infrastructure Partners
        </p>
        <p className="text-white text-sm md:text-base font-medium max-w-lg">
          Powered by the infrastructure behind private agent commerce
        </p>
      </div>

      <div className="relative w-full overflow-hidden mask-image-linear-edges">
        <div className="flex w-max animate-marquee items-center">
          {doubled.map((logo, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center mx-8 md:mx-12"
              style={{ width: logo.w, height: logo.h }}
            >
              {logo.src ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logo.src}
                  alt={logo.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    filter: logo.forceWhite
                      ? "brightness(0) invert(1)"
                      : "grayscale(1) contrast(4) brightness(2)",
                    mixBlendMode: logo.forceWhite ? "normal" : "screen",
                    opacity: logo.op,
                    transition: "opacity 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.opacity = String(logo.op))
                  }
                />
              ) : (
                <span className="text-zinc-600 font-bold text-lg tracking-wider uppercase opacity-50 hover:opacity-90 transition-opacity">
                  {logo.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </section>
  );
}
