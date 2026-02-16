import { apiGet, apiPost } from "./client";
import type {
  Channel,
  GetChannelsRequest,
  PostChannelListingRequest,
  PageableResponse,
} from "../types/api";

export function searchChannels(req: GetChannelsRequest, page = 0, size = 20) {
  return apiPost<PageableResponse<Channel>>(`/v1/channels?page=${page}&size=${size}`, req);
}

export function getMyChannels(page = 0, size = 20) {
  return apiGet<PageableResponse<Channel>>(
    `/v1/channels/me?page=${page}&size=${size}`,
  );
}

export function createChannelListing(channelId: string, req: PostChannelListingRequest) {
  return apiPost<void>(`/v1/channels/${channelId}/listing`, req);
}
