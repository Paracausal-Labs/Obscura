const BASE_URL = "https://app.bitgo-test.com/api/v2";

export function isBitGoEnabled(): boolean {
  return process.env.BITGO_ENABLED === "true";
}

function getHeaders(): Record<string, string> {
  const token = process.env.BITGO_ACCESS_TOKEN;
  if (!token) throw new Error("BITGO_ACCESS_TOKEN not set");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function getWalletId(): string {
  const id = process.env.BITGO_WALLET_ID;
  if (!id) throw new Error("BITGO_WALLET_ID not set");
  return id;
}

function getPassphrase(): string {
  const pass = process.env.BITGO_WALLET_PASSPHRASE;
  if (!pass) throw new Error("BITGO_WALLET_PASSPHRASE not set");
  return pass;
}

async function bitgoFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`BitGo API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function getWallet() {
  const walletId = getWalletId();
  return bitgoFetch(`/tbase/wallet/${walletId}`);
}

export async function createAddress(label: string) {
  const walletId = getWalletId();
  return bitgoFetch(`/tbase/wallet/${walletId}/address`, {
    method: "POST",
    body: JSON.stringify({ label }),
  });
}

export async function sendTransaction(params: {
  address: string;
  amount: string;
  data?: string;
}) {
  const walletId = getWalletId();
  return bitgoFetch(`/tbase/wallet/${walletId}/sendcoins`, {
    method: "POST",
    body: JSON.stringify({
      address: params.address,
      amount: params.amount,
      walletPassphrase: getPassphrase(),
      data: params.data,
    }),
  });
}

export async function signAndBroadcast(unsignedTxData: string) {
  const walletId = getWalletId();

  const signed = await bitgoFetch<{ txHex: string }>(
    `/tbase/wallet/${walletId}/signtx`,
    {
      method: "POST",
      body: JSON.stringify({
        txPrebuild: { txHex: unsignedTxData },
        walletPassphrase: getPassphrase(),
      }),
    }
  );

  return bitgoFetch(`/tbase/wallet/${walletId}/submittx`, {
    method: "POST",
    body: JSON.stringify({ halfSigned: { txHex: signed.txHex } }),
  });
}
