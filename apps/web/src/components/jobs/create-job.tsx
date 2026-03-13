"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { classifyJobAgent } from "@/lib/config/agents";
import { AGENTS } from "@/lib/config/agents";

export function CreateJob() {
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("0.05");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const suggestedAgent = description ? classifyJobAgent(description) : null;
  const agentMeta = suggestedAgent ? AGENTS[suggestedAgent] : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          budget: Math.round(parseFloat(budget) * 1e6),
        }),
      });
      const data = await res.json();
      setResult(data.message || "Job submitted");
      setDescription("");
    } catch {
      setResult("Failed to submit job");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Post a Job</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">What do you need?</label>
            <Input
              placeholder='e.g. "Find me the best yield for 500 USDC on Base"'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          {suggestedAgent && agentMeta && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-500">Auto-selected:</span>
              <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-violet-500/20">
                {agentMeta.name}.eth
              </Badge>
              <span className="text-xs text-zinc-600">({agentMeta.description})</span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Budget (USDC)</label>
              <Input
                type="number"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="bg-zinc-800 border-zinc-700 w-32"
              />
            </div>
            <div className="flex-1" />
            <Button
              type="submit"
              disabled={!description.trim() || submitting}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {submitting ? "Submitting..." : "Post Job →"}
            </Button>
          </div>

          {result && (
            <p className="text-xs text-green-400">{result}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
