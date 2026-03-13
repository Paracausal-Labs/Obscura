"use client";

import { useEffect, useRef } from "react";
import type { AreaData, UTCTimestamp } from "lightweight-charts";

export function PortfolioChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cleanup: (() => void) | null = null;

    import("lightweight-charts").then((lc) => {
      if (!containerRef.current) return;

      const chart = lc.createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: 280,
        layout: {
          background: { color: "transparent" },
          textColor: "#52525b",
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.03)" },
          horzLines: { color: "rgba(255,255,255,0.03)" },
        },
        rightPriceScale: { borderColor: "rgba(255,255,255,0.06)" },
        timeScale: { borderColor: "rgba(255,255,255,0.06)" },
      });

      const series = chart.addSeries(lc.AreaSeries, {
        topColor: "rgba(255, 0, 51, 0.15)",
        bottomColor: "rgba(255, 0, 51, 0.0)",
        lineColor: "#ff0033",
        lineWidth: 2,
      });

      const now = Math.floor(Date.now() / 1000);
      const data: AreaData<UTCTimestamp>[] = [];
      let value = 11000;
      for (let i = 30; i >= 0; i--) {
        value += (Math.random() - 0.45) * 200;
        value = Math.max(10000, Math.min(14000, value));
        data.push({
          time: (now - i * 86400) as UTCTimestamp,
          value: Math.round(value),
        });
      }
      series.setData(data);
      chart.timeScale().fitContent();

      cleanup = () => chart.remove();
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div className="relative rounded-[2rem] border border-white/[0.06] bg-[#0c0d12] p-5 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff0033]/30 to-transparent" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#ff0033] rounded-full blur-[100px] opacity-[0.04] pointer-events-none" />
      <p className="text-[#ff0033] text-[10px] font-semibold uppercase tracking-widest mb-1">
        Portfolio
      </p>
      <h3 className="text-lg font-light text-white tracking-tight mb-3">Portfolio Value</h3>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
