"use client";

import { Card, CardContent } from "@/components/ui/card";
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
        height: 250,
        layout: {
          background: { color: "transparent" },
          textColor: "#71717a",
        },
        grid: {
          vertLines: { color: "#27272a" },
          horzLines: { color: "#27272a" },
        },
        rightPriceScale: { borderColor: "#27272a" },
        timeScale: { borderColor: "#27272a" },
      });

      const series = chart.addSeries(lc.AreaSeries, {
        topColor: "rgba(139, 92, 246, 0.3)",
        bottomColor: "rgba(139, 92, 246, 0.0)",
        lineColor: "#8b5cf6",
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
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-2">Portfolio Value</h3>
        <div ref={containerRef} className="w-full" />
      </CardContent>
    </Card>
  );
}
