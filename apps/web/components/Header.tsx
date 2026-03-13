"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={clsx(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
            scrolled ? "py-4 bg-[#07080a]/85 backdrop-blur-xl border-b border-white/5 shadow-2xl" : "py-8 bg-transparent"
        )}>
            <nav className="flex items-center justify-between px-6 md:px-12 max-w-[1600px] mx-auto">
                <div className="flex items-center space-x-3">
                    <Image src="/logo.png" alt="Obscura Logo" width={140} height={48} className="w-auto h-8 lg:h-10 object-contain" />
                    <span className="text-xl lg:text-2xl font-bold tracking-[0.2em] text-white uppercase" style={{ fontFamily: "Impact, 'Arial Black', sans-serif" }}>
                        OBSCURA
                    </span>
                </div>

                <div className="hidden md:flex items-center space-x-8">
                    <Link href="#product" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Product</Link>
                    <Link href="#agents" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Agents</Link>
                    <Link href="#privacy" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Privacy</Link>
                    <Link href="#architecture" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Architecture</Link>
                    <Link href="#docs" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Docs</Link>
                </div>

                <div className="flex items-center space-x-4">
                    <button className="hidden sm:block px-5 py-2.5 rounded-full border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-colors backdrop-blur-md">
                        View Demo
                    </button>
                    <button className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        Open App
                    </button>
                </div>
            </nav>
        </header>
    );
}
