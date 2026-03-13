declare module "@fileverse/agents" {
  export class Agent {
    constructor(config: {
      chain: string;
      viemAccount: import("viem/accounts").PrivateKeyAccount;
      pimlicoAPIKey: string;
      storageProvider: unknown;
    });
    setupStorage(namespace: string): Promise<void>;
    create(content: string): Promise<{ fileId: string }>;
    getFile(fileId: string): Promise<{ content: string }>;
    update(fileId: string, content: string): Promise<{ fileId: string }>;
    delete(fileId: string): Promise<void>;
  }
}

declare module "@fileverse/agents/storage" {
  export class PinataStorageProvider {
    constructor(config: { jwt: string; gateway: string });
  }
}
