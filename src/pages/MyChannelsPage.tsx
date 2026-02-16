import { useState, useEffect, useCallback } from "react";
import { Group, GroupItem, Text, Spinner, Button, Sheet, Input, useToast } from "@telegram-tools/ui-kit";
import { getMyChannels, createChannelListing } from "../api/channels";
import type { Channel } from "../types/api";
import { ChannelAvatar } from "../components/ChannelAvatar";
import { EmptyState } from "../components/EmptyState";

function ChannelDetail({ channel, onListed }: { channel: Channel; onListed: () => void }) {
  const [description, setDescription] = useState("");
  const [formatType, setFormatType] = useState("");
  const [price, setPrice] = useState("");
  const [pricePer, setPricePer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleList = async () => {
    if (!description.trim() || !formatType.trim() || !price) return;
    setSubmitting(true);
    try {
      await createChannelListing(channel.id, {
        description: description.trim(),
        formatPrices: [{ type: formatType.trim(), price: Number(price), pricePer: pricePer.trim() || undefined }],
      });
      showToast("Channel listed!", { type: "success" });
      onListed();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to list channel", { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

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

      <div style={{ marginTop: 8 }}><Text type="title3">List to Marketplace</Text></div>
      <Group header="Listing details">
        <GroupItem main={<Input value={description} onChange={setDescription} placeholder="Listing description" />} />
        <GroupItem main={<Input value={formatType} onChange={setFormatType} placeholder="Ad format (e.g. Post, Story)" />} />
        <GroupItem main={<Input value={price} onChange={setPrice} placeholder="Price (TON)" type="number" />} />
        <GroupItem main={<Input value={pricePer} onChange={setPricePer} placeholder="Price per (e.g. per 1000 views)" />} />
      </Group>
      <Button
        text={submitting ? "Listing..." : "List to Marketplace"}
        onClick={handleList}
        disabled={submitting || !description.trim() || !formatType.trim() || !price}
      />
    </div>
  );
}

export function MyChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyChannels();
      setChannels(res.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load channels");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        load();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [load]);

  const handleAddBot = () => {
    const botUsername = import.meta.env.VITE_BOT_USERNAME ?? "to_split_bot";
    window.Telegram?.WebApp?.openTelegramLink(
      `https://t.me/${botUsername}?startgroup&admin=post_messages`
    );
  };

  const openDetail = (ch: Channel) => {
    setSelectedChannel(ch);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setSelectedChannel(null);
  };

  const handleListed = () => {
    closeSheet();
    load();
  };

  const sheets: Record<string, React.ComponentType> = {
    detail: () => selectedChannel ? <ChannelDetail channel={selectedChannel} onListed={handleListed} /> : null,
  };

  return (
    <div>
      <div style={{ padding: "16px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Text type="title2">My Channels</Text>
        <Button text="Add Bot" type="secondary" onClick={handleAddBot} />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spinner size="32px" color="primary" />
        </div>
      ) : error ? (
        <EmptyState title="Error" description={error} />
      ) : channels.length === 0 ? (
        <EmptyState
          title="No channels"
          description="Add the bot to your Telegram channel as an admin to see it here"
        />
      ) : (
        <Group>
          {channels.map((ch) => (
            <GroupItem
              key={ch.id}
              before={<ChannelAvatar title={ch.title} />}
              main={<Text type="body" weight="medium">{ch.title}</Text>}
              description={ch.username ? `@${ch.username}` : undefined}
              after={
                <Text type="caption1" color="secondary">
                  {ch.isPublic ? "Public" : "Private"}
                </Text>
              }
              chevron
              onClick={() => openDetail(ch)}
            />
          ))}
        </Group>
      )}

      <Sheet
        sheets={sheets}
        activeSheet={sheetOpen ? "detail" : null}
        opened={sheetOpen}
        onClose={closeSheet}
      />
    </div>
  );
}
