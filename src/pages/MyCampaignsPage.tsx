import { useState, useEffect, useCallback } from "react";
import { Group, GroupItem, Text, Spinner, Button, Sheet, Input, Select, useToast } from "@telegram-tools/ui-kit";
import { getMarketplaceCampaigns, getMyCampaigns, createCampaign, respondToCampaign, getCampaignApplications, acceptApplication, rejectApplication } from "../api/campaigns";
import type { Campaign, CampaignApplication, Channel } from "../types/api";
import { getMyChannels } from "../api/channels";
import { StatusBadge } from "../components/StatusBadge";
import { EmptyState } from "../components/EmptyState";

type Tab = "all" | "my";

const LANGUAGE_OPTIONS = [
  { label: "Not selected", value: null },
  { label: "English", value: "en" },
  { label: "Russian", value: "ru" },
  { label: "Spanish", value: "es" },
  { label: "German", value: "de" },
  { label: "French", value: "fr" },
  { label: "Chinese", value: "zh" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
];

function CreateCampaignSheet({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [budget, setBudget] = useState("");
  const [subsMin, setSubsMin] = useState("");
  const [subsMax, setSubsMax] = useState("");
  const [avgViewsMin, setAvgViewsMin] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [language, setLanguage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!title.trim() || !summary.trim()) return;
    setSubmitting(true);
    try {
      await createCampaign({
        title: title.trim(),
        briefSummary: summary.trim(),
        budgetTotal: budget ? Number(budget) : undefined,
        targetSubscribersMin: subsMin ? Number(subsMin) : undefined,
        targetSubscribersMax: subsMax ? Number(subsMax) : undefined,
        targetAvgViewsMin: avgViewsMin ? Number(avgViewsMin) : undefined,
        targetPriceMin: priceMin ? Number(priceMin) : undefined,
        targetPriceMax: priceMax ? Number(priceMax) : undefined,
        targetLanguages: language ? [language] : undefined,
      });
      showToast("Campaign created", { type: "success" });
      onCreated();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create campaign", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <Text type="title3">New Campaign</Text>
      <Group header="Details">
        <GroupItem main={<Input value={title} onChange={setTitle} placeholder="Campaign title" />} />
        <GroupItem main={<Input value={summary} onChange={setSummary} placeholder="Brief summary" />} />
      </Group>
      <Group header="Budget (TON)">
        <GroupItem main={<Input value={budget} onChange={setBudget} placeholder="Total budget" type="number" />} />
      </Group>
      <Group header="Target subscribers">
        <GroupItem main={<Input value={subsMin} onChange={setSubsMin} placeholder="Min" type="number" />} />
        <GroupItem main={<Input value={subsMax} onChange={setSubsMax} placeholder="Max" type="number" />} />
      </Group>
      <Group header="Target avg views">
        <GroupItem main={<Input value={avgViewsMin} onChange={setAvgViewsMin} placeholder="Min views" type="number" />} />
      </Group>
      <Group header="Target price (TON)">
        <GroupItem main={<Input value={priceMin} onChange={setPriceMin} placeholder="Min" type="number" />} />
        <GroupItem main={<Input value={priceMax} onChange={setPriceMax} placeholder="Max" type="number" />} />
      </Group>
      <Group header="Language">
        <GroupItem main={<Select options={LANGUAGE_OPTIONS} value={language} onChange={setLanguage} />} />
      </Group>
      <Button text={submitting ? "Creating..." : "Create Campaign"} onClick={handleSubmit} disabled={submitting || !title.trim() || !summary.trim()} />
    </div>
  );
}

function CampaignDetail({ campaign, onRespond }: { campaign: Campaign; onRespond: () => void }) {
  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text type="title3">{campaign.title}</Text>
        <StatusBadge status={campaign.status} />
      </div>
      <Group header="Summary">
        <GroupItem main={<Text type="body">{campaign.briefSummary}</Text>} />
      </Group>
      <Group header="Details">
        {campaign.budgetTotalTon != null && (
          <GroupItem main={<Text type="body">Budget</Text>} after={<Text type="body" color="secondary">{campaign.budgetTotalTon} TON</Text>} />
        )}
        {(campaign.targetSubscribersMin != null || campaign.targetSubscribersMax != null) && (
          <GroupItem main={<Text type="body">Subscribers</Text>} after={<Text type="body" color="secondary">{campaign.targetSubscribersMin ?? "—"} – {campaign.targetSubscribersMax ?? "—"}</Text>} />
        )}
        {campaign.targetAvgViewsMin != null && (
          <GroupItem main={<Text type="body">Avg views min</Text>} after={<Text type="body" color="secondary">{campaign.targetAvgViewsMin}</Text>} />
        )}
        {(campaign.targetPriceMin != null || campaign.targetPriceMax != null) && (
          <GroupItem main={<Text type="body">Price (TON)</Text>} after={<Text type="body" color="secondary">{campaign.targetPriceMin ?? "—"} – {campaign.targetPriceMax ?? "—"}</Text>} />
        )}
        {campaign.targetLanguages && campaign.targetLanguages.length > 0 && (
          <GroupItem main={<Text type="body">Languages</Text>} after={<Text type="body" color="secondary">{campaign.targetLanguages.join(", ")}</Text>} />
        )}
      </Group>
      <Button text="Respond" onClick={onRespond} />
    </div>
  );
}

function RespondSheet({ campaign, onDone }: { campaign: Campaign; onDone: () => void }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [price, setPrice] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    getMyChannels(0, 100)
      .then((res) => {
        setChannels(res.result);
        if (res.result.length === 1) setChannelId(res.result[0].id);
      })
      .catch(() => showToast("Failed to load channels", { type: "error" }))
      .finally(() => setLoadingChannels(false));
  }, []);

  const channelOptions = channels.map((ch) => ({ label: ch.title, value: ch.id }));

  const handleSubmit = async () => {
    if (!channelId || !price || Number(price) <= 0) return;
    setSubmitting(true);
    try {
      await respondToCampaign(campaign.id, channelId, Number(price), comment.trim());
      showToast("Response sent", { type: "success" });
      onDone();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to respond", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingChannels) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spinner size="32px" color="primary" />
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <EmptyState title="No channels" description="You need to add a channel before responding to campaigns" />
      </div>
    );
  }

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <Text type="title3">Respond to "{campaign.title}"</Text>
      <Group header="Channel">
        <GroupItem main={<Select options={channelOptions} value={channelId} onChange={setChannelId} />} />
      </Group>
      <Group header="Price (TON)">
        <GroupItem main={<Input value={price} onChange={setPrice} placeholder="Your price" type="number" />} />
      </Group>
      <Group header="Comment">
        <GroupItem main={
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            rows={4}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid var(--tg-theme-hint-color, #ccc)",
              borderRadius: 8,
              background: "var(--tg-theme-secondary-bg-color, #f5f5f5)",
              color: "var(--tg-theme-text-color, #000)",
              fontSize: 14,
              resize: "vertical",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        } />
      </Group>
      <Button text={submitting ? "Sending..." : "Send Response"} onClick={handleSubmit} disabled={submitting || !channelId || !price || Number(price) <= 0} />
    </div>
  );
}

function MyCampaignDetail({ campaign, onSelectApplication }: { campaign: Campaign; onSelectApplication: (app: CampaignApplication) => void }) {
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  useEffect(() => {
    getCampaignApplications(campaign.id)
      .then(setApplications)
      .catch(() => {})
      .finally(() => setLoadingApps(false));
  }, [campaign.id]);

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text type="title3">{campaign.title}</Text>
        <StatusBadge status={campaign.status} />
      </div>
      <Group header="Summary">
        <GroupItem main={<Text type="body">{campaign.briefSummary}</Text>} />
      </Group>
      <Group header="Details">
        {campaign.budgetTotalTon != null && (
          <GroupItem main={<Text type="body">Budget</Text>} after={<Text type="body" color="secondary">{campaign.budgetTotalTon} TON</Text>} />
        )}
        {(campaign.targetSubscribersMin != null || campaign.targetSubscribersMax != null) && (
          <GroupItem main={<Text type="body">Subscribers</Text>} after={<Text type="body" color="secondary">{campaign.targetSubscribersMin ?? "—"} – {campaign.targetSubscribersMax ?? "—"}</Text>} />
        )}
        {campaign.targetAvgViewsMin != null && (
          <GroupItem main={<Text type="body">Avg views min</Text>} after={<Text type="body" color="secondary">{campaign.targetAvgViewsMin}</Text>} />
        )}
        {(campaign.targetPriceMin != null || campaign.targetPriceMax != null) && (
          <GroupItem main={<Text type="body">Price (TON)</Text>} after={<Text type="body" color="secondary">{campaign.targetPriceMin ?? "—"} – {campaign.targetPriceMax ?? "—"}</Text>} />
        )}
        {campaign.targetLanguages && campaign.targetLanguages.length > 0 && (
          <GroupItem main={<Text type="body">Languages</Text>} after={<Text type="body" color="secondary">{campaign.targetLanguages.join(", ")}</Text>} />
        )}
      </Group>
      <Text type="title3">Applications</Text>
      {loadingApps ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
          <Spinner size="32px" color="primary" />
        </div>
      ) : applications.length === 0 ? (
        <Text type="body" color="secondary">No applications yet</Text>
      ) : (
        <Group>
          {applications.map((app) => (
            <GroupItem
              key={app.id}
              main={<Text type="body" weight="medium">{app.proposedPriceTon != null ? `${app.proposedPriceTon} TON` : "No price"}</Text>}
              description={app.comment || "No comment"}
              after={<StatusBadge status={app.status} />}
              chevron
              onClick={() => onSelectApplication(app)}
            />
          ))}
        </Group>
      )}
    </div>
  );
}

function ApplicationDetailSheet({ campaign, application, onDone }: { campaign: Campaign; application: CampaignApplication; onDone: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      await acceptApplication(campaign.id, application.id);
      showToast("Application accepted", { type: "success" });
      onDone();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to accept", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await rejectApplication(campaign.id, application.id);
      showToast("Application rejected", { type: "success" });
      onDone();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to reject", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
      <Text type="title3">Application Details</Text>
      <Group header="Info">
        {application.proposedPriceTon != null && (
          <GroupItem main={<Text type="body">Proposed price</Text>} after={<Text type="body" color="secondary">{application.proposedPriceTon} TON</Text>} />
        )}
        <GroupItem main={<Text type="body">Status</Text>} after={<StatusBadge status={application.status} />} />
        <GroupItem main={<Text type="body">Date</Text>} after={<Text type="body" color="secondary">{new Date(application.createdAt).toLocaleDateString()}</Text>} />
      </Group>
      {application.comment && (
        <Group header="Comment">
          <GroupItem main={<Text type="body">{application.comment}</Text>} />
        </Group>
      )}
      {application.status.toLowerCase() === "pending" && (
        <div style={{ display: "flex", gap: 8, paddingBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <Button text={submitting ? "..." : "Accept"} onClick={handleAccept} disabled={submitting} />
          </div>
          <div style={{ flex: 1 }}>
            <Button text={submitting ? "..." : "Reject"} onClick={handleReject} disabled={submitting} />
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignList({ campaigns, onSelect }: { campaigns: Campaign[]; onSelect: (c: Campaign) => void }) {
  if (campaigns.length === 0) {
    return <EmptyState title="No campaigns" description="No campaigns found" />;
  }

  return (
    <Group>
      {campaigns.map((c) => (
        <GroupItem
          key={c.id}
          main={<Text type="body" weight="medium">{c.title}</Text>}
          description={c.briefSummary}
          after={<StatusBadge status={c.status} />}
          chevron
          onClick={() => onSelect(c)}
        />
      ))}
    </Group>
  );
}

export function MyCampaignsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<CampaignApplication | null>(null);

  const load = useCallback(async (activeTab: Tab) => {
    setLoading(true);
    setError(null);
    try {
      const fetcher = activeTab === "all" ? getMarketplaceCampaigns : getMyCampaigns;
      const res = await fetcher();
      setCampaigns(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  const openCreate = () => {
    setActiveSheet("create");
    setSheetOpen(true);
  };

  const openDetail = (c: Campaign) => {
    setSelectedCampaign(c);
    setActiveSheet(tab === "my" ? "myDetail" : "detail");
    setSheetOpen(true);
  };

  const openRespond = () => {
    setActiveSheet("respond");
  };

  const openApplicationDetail = (app: CampaignApplication) => {
    setSelectedApplication(app);
    setActiveSheet("applicationDetail");
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setActiveSheet(null);
  };

  const handleCreated = () => {
    closeSheet();
    load(tab);
  };

  const handleResponded = () => {
    closeSheet();
    load(tab);
  };

  const handleApplicationAction = () => {
    closeSheet();
    load(tab);
  };

  const sheets: Record<string, React.ComponentType> = {
    create: () => <CreateCampaignSheet onCreated={handleCreated} />,
    detail: () => selectedCampaign ? <CampaignDetail campaign={selectedCampaign} onRespond={openRespond} /> : null,
    myDetail: () => selectedCampaign ? <MyCampaignDetail campaign={selectedCampaign} onSelectApplication={openApplicationDetail} /> : null,
    respond: () => selectedCampaign ? <RespondSheet campaign={selectedCampaign} onDone={handleResponded} /> : null,
    applicationDetail: () => selectedCampaign && selectedApplication ? <ApplicationDetailSheet campaign={selectedCampaign} application={selectedApplication} onDone={handleApplicationAction} /> : null,
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "10px 0",
    border: "none",
    background: "none",
    color: active ? "var(--tg-theme-button-color, #3390ec)" : "var(--tg-theme-hint-color, #999)",
    fontWeight: active ? 600 : 400,
    fontSize: 14,
    cursor: "pointer",
    borderBottom: active ? "2px solid var(--tg-theme-button-color, #3390ec)" : "2px solid transparent",
    marginBottom: -1,
  });

  return (
    <div style={{ position: "relative", minHeight: "100%" }}>
      <div style={{ padding: "16px 16px 8px" }}>
        <Text type="title2">Campaigns</Text>
      </div>

      <div style={{ display: "flex", padding: "0 16px 8px", borderBottom: "1px solid var(--tg-theme-hint-color, #ccc)" }}>
        <button onClick={() => setTab("all")} style={tabStyle(tab === "all")}>
          All Campaigns
        </button>
        <button onClick={() => setTab("my")} style={tabStyle(tab === "my")}>
          My Campaigns
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spinner size="32px" color="primary" />
        </div>
      ) : error ? (
        <EmptyState title="Error" description={error} />
      ) : (
        <CampaignList campaigns={campaigns} onSelect={openDetail} />
      )}

      {tab === "my" && (
        <button
          onClick={openCreate}
          style={{
            position: "fixed",
            bottom: 80,
            right: 16,
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "none",
            background: "var(--tg-theme-button-color, #3390ec)",
            color: "var(--tg-theme-button-text-color, #fff)",
            fontSize: 24,
            lineHeight: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 10,
          }}
          aria-label="Create campaign"
        >
          +
        </button>
      )}

      <Sheet
        sheets={sheets}
        activeSheet={activeSheet}
        opened={sheetOpen}
        onClose={closeSheet}
      />
    </div>
  );
}
