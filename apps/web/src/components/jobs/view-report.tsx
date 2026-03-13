"use client";

import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { Button } from "@/components/ui/button";

interface ViewReportProps {
  jobId: number;
  fileId: string;
}

export function ViewReport({ jobId, fileId }: ViewReportProps) {
  const [content, setContent] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "signing" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  async function handleView() {
    if (!address) return;

    try {
      setStatus("signing");
      const userSignature = await signMessageAsync({
        message: `Obscura encryption key for job #${jobId}`,
      });

      setStatus("loading");
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          jobId: String(jobId),
          client: address,
          userSignature,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to decrypt report");
      }

      const data = await res.json();
      setContent(data.content);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Decryption failed");
    }
  }

  if (status === "done" && content) {
    return (
      <div className="mt-2 p-3 rounded-xl bg-[#0c0d12] border border-white/[0.06] max-h-48 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#ff0033] font-medium">
            Decrypted Report (Fileverse)
          </span>
          <button
            onClick={() => { setContent(null); setStatus("idle"); }}
            className="text-[10px] text-zinc-600 hover:text-zinc-400"
          >
            Close
          </button>
        </div>
        <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
          {content}
        </pre>
      </div>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={handleView}
        disabled={status === "signing" || status === "loading"}
        className="h-5 px-2 text-[10px] border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/[0.12] rounded-lg"
      >
        {status === "signing" ? "Sign to decrypt..." :
         status === "loading" ? "Decrypting..." :
         status === "error" ? "Retry" :
         "View Report"}
      </Button>
      {status === "error" && errorMsg && (
        <span className="text-[10px] text-red-400 ml-1">{errorMsg}</span>
      )}
    </>
  );
}
