import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "crypto";
import type { EncryptedPayload } from "@obscura/shared";

export function deriveKeyFromSignature(signature: string, salt: string = ""): Buffer {
  return createHash("sha256").update(signature).update(salt).digest();
}

export function encrypt(text: string, key: Buffer): EncryptedPayload {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    encrypted: encrypted.toString("hex"),
  };
}

export function decrypt(payload: EncryptedPayload, key: Buffer): string {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(payload.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.encrypted, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function encodePayload(payload: EncryptedPayload): string {
  return `ENCRYPTED:${payload.iv}:${payload.tag}:${payload.encrypted}`;
}

export function decodePayload(encoded: string): EncryptedPayload {
  const parts = encoded.split(":");
  if (parts[0] !== "ENCRYPTED" || parts.length !== 4) {
    throw new Error("Invalid encrypted payload format");
  }
  return { iv: parts[1], tag: parts[2], encrypted: parts[3] };
}
