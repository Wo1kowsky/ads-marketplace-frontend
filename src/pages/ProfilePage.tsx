import { useEffect, useState, useCallback } from "react";
import { Group, GroupItem, Text, Button, Spinner, Sheet } from "@telegram-tools/ui-kit";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { ChannelAvatar } from "../components/ChannelAvatar";
import { StatusBadge } from "../components/StatusBadge";
import { EmptyState } from "../components/EmptyState";
import { connectWallet } from "../api/wallet";
import { getDeals, getDeal } from "../api/deals";
import type { Deal } from "../types/api";

function DealDetail({ dealId }: { dealId: string }) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDeal(dealId)
      .then(setDeal)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dealId]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spinner size="32px" color="primary" />
      </div>
    );
  }

  if (!deal) {
    return <EmptyState title="Error" description="Failed to load deal" />;
  }

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text type="title3">{deal.title}</Text>
        <StatusBadge status={deal.status} />
      </div>
      <Group header="Summary">
        <GroupItem main={<Text type="body">{deal.briefSummary}</Text>} />
      </Group>
      <Group header="Details">
        {deal.priceTon != null && (
          <GroupItem
            main={<Text type="body">Price</Text>}
            after={<Text type="body" color="secondary">{deal.priceTon} TON</Text>}
          />
        )}
        <GroupItem
          main={<Text type="body">Campaign ID</Text>}
          after={<Text type="body" color="secondary">{deal.campaignId.slice(0, 8)}...</Text>}
        />
        <GroupItem
          main={<Text type="body">Channel Listing</Text>}
          after={<Text type="body" color="secondary">{deal.channelListingId.slice(0, 8)}...</Text>}
        />
        {deal.rejectReason && (
          <GroupItem
            main={<Text type="body">Reject Reason</Text>}
            after={<Text type="body" color="secondary">{deal.rejectReason}</Text>}
          />
        )}
        <GroupItem
          main={<Text type="body">Created</Text>}
          after={<Text type="body" color="secondary">{new Date(deal.createdAt).toLocaleDateString()}</Text>}
        />
      </Group>
    </div>
  );
}

export function ProfilePage() {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ")
    : "Unknown";

  useEffect(() => {
    if (wallet?.account?.address) {
      connectWallet(wallet.account.address).catch(console.error);
    }
  }, [wallet?.account?.address]);

  const loadDeals = useCallback(async () => {
    setDealsLoading(true);
    try {
      const res = await getDeals();
      setDeals(res);
    } catch {
      console.error("Failed to load deals");
    } finally {
      setDealsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  const handleConnectWallet = () => {
    if (wallet) {
      tonConnectUI.disconnect();
    } else {
      tonConnectUI.openModal();
    }
  };

  const openDeal = (deal: Deal) => {
    setSelectedDealId(deal.id);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setSelectedDealId(null);
  };

  const sheets: Record<string, React.ComponentType> = {
    detail: () => selectedDealId ? <DealDetail dealId={selectedDealId} /> : null,
  };

  return (
    <div>
      <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <ChannelAvatar title={fullName} size={64} />
        <Text type="title2">{fullName}</Text>
        {user?.username && (
          <Text type="subheadline1" color="secondary">@{user.username}</Text>
        )}
      </div>

      {wallet && (
        <Group header="Wallet">
          <GroupItem
            main={<Text type="body">Address</Text>}
            after={
              <Text type="body" color="secondary">
                {wallet.account.address.slice(0, 6)}...{wallet.account.address.slice(-4)}
              </Text>
            }
          />
        </Group>
      )}

      <div style={{ padding: 16 }}>
        <Button
          text={wallet ? "Disconnect Wallet" : "Connect Wallet"}
          type={wallet ? "secondary" : "primary"}
          onClick={handleConnectWallet}
        />
      </div>

      <Group header="Deals">
        {dealsLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
            <Spinner size="32px" color="primary" />
          </div>
        ) : deals.length === 0 ? (
          <GroupItem main={<Text type="body" color="secondary">No deals yet</Text>} />
        ) : (
          deals.map((deal) => (
            <GroupItem
              key={deal.id}
              main={<Text type="body" weight="medium">{deal.title}</Text>}
              description={deal.briefSummary}
              after={<StatusBadge status={deal.status} />}
              chevron
              onClick={() => openDeal(deal)}
            />
          ))
        )}
      </Group>

      <Sheet
        sheets={sheets}
        activeSheet={selectedDealId ? "detail" : null}
        opened={sheetOpen}
        onClose={closeSheet}
      />
    </div>
  );
}
