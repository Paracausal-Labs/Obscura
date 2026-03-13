import { NextResponse } from "next/server";
import { verifyMessage } from "viem";
import { readEncryptedReport } from "@/lib/integrations/fileverse";

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

    const content = await readEncryptedReport(fileId, userSignature, String(jobId));

    return NextResponse.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
