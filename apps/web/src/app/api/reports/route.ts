import { NextResponse } from "next/server";
import { verifyMessage } from "viem";
import { readEncryptedReport } from "@/lib/integrations/fileverse";
import { getLocalReport } from "@/lib/integrations/local-reports";
import { deriveKeyFromSignature, decodePayload, decrypt } from "@/lib/integrations/crypto";

export async function POST(req: Request) {
  try {
    const { fileId, jobId, client, userSignature } = await req.json();

    if (!fileId || !jobId || !client || !userSignature) {
      return NextResponse.json(
        { error: "fileId, jobId, client, and userSignature are required" },
        { status: 400 }
      );
    }

    // Verify signature matches claimed client
    const message = `Obscura encryption key for job #${jobId}`;
    const sigValid = await verifyMessage({
      address: client as `0x${string}`,
      message,
      signature: userSignature as `0x${string}`,
    });

    if (!sigValid) {
      return NextResponse.json(
        { error: "Signature does not match client address" },
        { status: 401 }
      );
    }

    let content: string;

    if (fileId.startsWith("local:")) {
      // Decrypt from in-memory local store
      const encrypted = getLocalReport(jobId);
      if (!encrypted) {
        return NextResponse.json(
          { error: "Report not found (server may have restarted)" },
          { status: 404 }
        );
      }
      const key = deriveKeyFromSignature(userSignature, String(jobId));
      const payload = decodePayload(encrypted);
      content = decrypt(payload, key);
    } else {
      // Decrypt from Fileverse/IPFS
      content = await readEncryptedReport(fileId, userSignature, String(jobId));
    }

    return NextResponse.json({ content });
  } catch {
    return NextResponse.json(
      { error: "Failed to decrypt report" },
      { status: 500 }
    );
  }
}
