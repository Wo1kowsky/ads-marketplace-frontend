import { apiGet, apiPost, apiPatch } from "./client";
import type {
  Campaign,
  CampaignApplication,
  CreateCampaignRequest,
} from "../types/api";

export function getMarketplaceCampaigns(page = 0, size = 20) {
  return apiGet<Campaign[]>(`/v1/campaigns/marketplace?page=${page}&size=${size}`);
}

export function getMyCampaigns(page = 0, size = 20) {
  return apiGet<Campaign[]>(`/v1/campaigns/my?page=${page}&size=${size}`);
}

export function createCampaign(req: CreateCampaignRequest) {
  return apiPost<Campaign>("/v1/campaigns/create", req);
}

export function respondToCampaign(campaignId: string, channelId: string, priceTon: number, comment: string) {
  return apiPost<void>(`/v1/campaigns/${campaignId}/respond`, { channelId, proposedPrice: priceTon, comment });
}

export function getCampaignApplications(campaignId: string, page = 0, size = 20) {
  return apiGet<CampaignApplication[]>(`/v1/campaigns/${campaignId}/applications?page=${page}&size=${size}`);
}

export function acceptApplication(campaignId: string, applicationId: string) {
  return apiPatch<void>(`/v1/campaigns/${campaignId}/${applicationId}/accept`);
}

export function rejectApplication(campaignId: string, applicationId: string) {
  return apiPatch<void>(`/v1/campaigns/${campaignId}/${applicationId}/reject`);
}
