import { apiPost } from "./client";

export function connectWallet(address: string) {
  return apiPost<void>("/v1/wallet/connect", { address });
}
