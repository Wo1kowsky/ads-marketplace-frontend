import { useState } from "react";
import { TabBar, type TabId } from "./TabBar";
import { MarketplacePage } from "../pages/MarketplacePage";
import { MyCampaignsPage } from "../pages/MyCampaignsPage";
import { MyChannelsPage } from "../pages/MyChannelsPage";
import { ProfilePage } from "../pages/ProfilePage";
import "./AppLayout.css";

export function AppLayout() {
  const [activeTab, setActiveTab] = useState<TabId>("marketplace");

  return (
    <div className="app-layout">
      <div className="app-layout__content">
        {activeTab === "marketplace" && <MarketplacePage />}
        {activeTab === "campaigns" && <MyCampaignsPage />}
        {activeTab === "channels" && <MyChannelsPage />}
        {activeTab === "profile" && <ProfilePage />}
      </div>
      <TabBar active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
