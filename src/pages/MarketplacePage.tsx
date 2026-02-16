import { useState, useEffect, useCallback } from "react";
import { Group, GroupItem, Text, Spinner, Button, Sheet, Input, Select } from "@telegram-tools/ui-kit";
import { searchChannels } from "../api/channels";
import type { Channel, GetChannelsRequestFilter } from "../types/api";
import { ChannelAvatar } from "../components/ChannelAvatar";
import { EmptyState } from "../components/EmptyState";

function FilterSheet({ onApply }: { onApply: (f: GetChannelsRequestFilter) => void }) {
  const [subMin, setSubMin] = useState("");
  const [subMax, setSubMax] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [lang, setLang] = useState<string | null>(null);

  const langOptions = [
    { label: "All", value: null },
    { label: "English", value: "en" },
    { label: "Russian", value: "ru" },
    { label: "Spanish", value: "es" },
    { label: "German", value: "de" },
  ];

  const handleApply = () => {
    const f: GetChannelsRequestFilter = {};
    if (subMin) f.targetSubscriptionsMin = Number(subMin);
    if (subMax) f.targetSubscriptionsMax = Number(subMax);
    if (priceMin) f.targetPriceMin = Number(priceMin);
    if (priceMax) f.targetPriceMax = Number(priceMax);
    if (lang) f.targetLanguages = [lang];
    onApply(f);
  };

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <Text type="title3">Filters</Text>
      <Group header="Subscribers">
        <GroupItem main={<Input value={subMin} onChange={setSubMin} placeholder="Min" type="number" />} />
        <GroupItem main={<Input value={subMax} onChange={setSubMax} placeholder="Max" type="number" />} />
      </Group>
      <Group header="Price (TON)">
        <GroupItem main={<Input value={priceMin} onChange={setPriceMin} placeholder="Min" type="number" />} />
        <GroupItem main={<Input value={priceMax} onChange={setPriceMax} placeholder="Max" type="number" />} />
      </Group>
      <Group header="Language">
        <GroupItem main={<Select options={langOptions} value={lang} onChange={setLang} />} />
      </Group>
      <Button text="Apply Filters" onClick={handleApply} />
    </div>
  );
}

function ChannelDetail({ channel }: { channel: Channel }) {
  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <ChannelAvatar title={channel.title} size={56} />
        <div>
          <Text type="title3">{channel.title}</Text>
          {channel.username && (
            <Text type="subheadline1" color="secondary">@{channel.username}</Text>
          )}
        </div>
      </div>
      {channel.description && (
        <Group header="Description">
          <GroupItem main={<Text type="body">{channel.description}</Text>} />
        </Group>
      )}
      <Group header="Info">
        <GroupItem main={<Text type="body">Public</Text>} after={<Text type="body" color="secondary">{channel.isPublic ? "Yes" : "No"}</Text>} />
      </Group>
    </div>
  );
}

export function MarketplacePage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GetChannelsRequestFilter | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const load = useCallback(async (f: GetChannelsRequestFilter | null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchChannels({
        filters: f ?? undefined,
      });
      setChannels(res.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load channels");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filters);
  }, [filters, load]);

  const handleApplyFilters = (f: GetChannelsRequestFilter) => {
    setFilters(f);
    setSheetOpen(false);
    setActiveSheet(null);
  };

  const openFilter = () => {
    setActiveSheet("filter");
    setSheetOpen(true);
  };

  const openDetail = (ch: Channel) => {
    setSelectedChannel(ch);
    setActiveSheet("detail");
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setActiveSheet(null);
  };

  const sheets: Record<string, React.ComponentType> = {
    filter: () => <FilterSheet onApply={handleApplyFilters} />,
    detail: () => selectedChannel ? <ChannelDetail channel={selectedChannel} /> : null,
  };

  return (
    <div>
      <div style={{ padding: "16px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text type="title2">Marketplace</Text>
        <Button text="Filters" type="secondary" onClick={openFilter} />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spinner size="32px" color="primary" />
        </div>
      ) : error ? (
        <EmptyState title="Error" description={error} />
      ) : channels.length === 0 ? (
        <EmptyState title="No channels found" description="Try adjusting your filters" />
      ) : (
        <Group>
          {channels.map((ch) => (
            <GroupItem
              key={ch.id}
              before={<ChannelAvatar title={ch.title} />}
              main={<Text type="body" weight="medium">{ch.title}</Text>}
              description={ch.username ? `@${ch.username}` : undefined}
              chevron
              onClick={() => openDetail(ch)}
            />
          ))}
        </Group>
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
