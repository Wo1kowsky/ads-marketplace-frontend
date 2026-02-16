import { apiGet } from "./client";
import type { Deal, PageableResponse } from "../types/api";

export async function getDeals(page = 0, size = 20) {
  const res = await apiGet<PageableResponse<Deal>>(`/v1/deals?page=${page}&size=${size}`);
  return res.result;
}

export function getDeal(dealId: string) {
  return apiGet<Deal>(`/v1/deals/${dealId}`);
}
