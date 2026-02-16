// --- Pageable ---

export interface PageableObject {
  offset?: number;
  paged?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface BasePageRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface PageableResponse<T> {
  result: T[];
  page: PageableObject;
}

// --- Channels ---

export interface Channel {
  id: string;
  telegramChannelId: number;
  username: string;
  title: string;
  ownerUserId: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetChannelsRequestFilter {
  targetSubscriptionsMin?: number;
  targetSubscriptionsMax?: number;
  targetAvgViewsMin?: number;
  targetLanguages?: string[];
  targetPriceMin?: number;
  targetPriceMax?: number;
}

export interface GetChannelsRequest {
  filters?: GetChannelsRequestFilter;
}

export interface PostChannelListingFormatPriceRequest {
  type: string;
  price: number;
  pricePer?: string;
  additionalParams?: string;
}

export interface PostChannelListingRequest {
  description: string;
  formatPrices: PostChannelListingFormatPriceRequest[];
}

// --- Campaigns ---

export interface Campaign {
  id: string;
  advertiserId: string;
  title: string;
  briefSummary: string;
  targetSubscribersMin?: number;
  targetSubscribersMax?: number;
  targetAvgViewsMin?: number;
  targetLanguages?: string[];
  targetPriceMin?: number;
  targetPriceMax?: number;
  budgetTotalTon?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetCampaignsRequest {
  page: BasePageRequest;
}

export interface CreateCampaignRequest {
  title: string;
  briefSummary: string;
  targetSubscribersMin?: number;
  targetSubscribersMax?: number;
  targetAvgViewsMin?: number;
  targetLanguages?: string[];
  targetPriceMin?: number;
  targetPriceMax?: number;
  budgetTotal?: number;
}

export interface CampaignApplication {
  id: string;
  campaignId: string;
  channelId: string;
  channelOwnerId: string;
  proposedPriceTon?: number;
  comment?: string;
  status: string;
  createdAt: string;
}

// --- Deals ---

export interface Deal {
  id: string;
  campaignId: string;
  channelListingId: string;
  advertiserId: string;
  channelOwnerId: string;
  title: string;
  briefSummary: string;
  status: string;
  priceTon?: number;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Ad Requests ---

export interface ChannelAdRequest {
  id: string;
  channelListingId: string;
  advertiserId: string;
  briefSummary: string;
  title: string;
  status: string;
  rejectReason?: string;
  budgetTotalTon?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdRequestRequest {
  title: string;
  briefSummary: string;
  budget: number;
}
