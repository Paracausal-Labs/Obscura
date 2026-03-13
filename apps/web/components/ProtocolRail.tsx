"use client";

import React from "react";

const logos = [
    { name: "ENS" },
    { name: "BitGo" },
    { name: "HeyElsa" },
    { name: "Fileverse" },
    { name: "Base" },
    { name: "Groq" },
    { name: "AgentCash" },
];

export function ProtocolRail() {
    return (
        <section className="relative w-full py-16 bg-[#07080a] border-t border-white/5 overflow-hidden">
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 mb-10 flex flex-col items-center">
                <h2 className="text-zinc-500 tracking-widest text-xs font-semibold mb-3 uppercase">
                    Infrastructure Partners
                </h2>
                <p className="text-white text-sm md:text-base text-center max-w-lg font-medium">
                    Powered by the infrastructure behind private agent commerce
                </p>
            </div>

            <div className="relative w-full flex overflow-hidden mask-image-linear-edges py-6">
                <div className="flex w-max animate-marquee whitespace-nowrap">
                    {/* Duplicate arrays for seamless CSS marquee loop */}
                    {[...logos, ...logos, ...logos, ...logos].map((logo, idx) => (
                        <div key={idx} className="flex items-center justify-center mx-10 md:mx-16 min-w-[140px]">
                            <span className="text-zinc-600 font-bold text-2xl md:text-3xl tracking-wider uppercase opacity-80 hover:opacity-100 hover:text-white transition-all duration-300">
                                {logo.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
