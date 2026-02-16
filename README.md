# Ads Marketplace Frontend

Telegram Mini App for advertising marketplace — connecting advertisers with Telegram channel owners.

## Getting Started

1. Create `.env` from the example:

```bash
cp .env.example .env
```

2. Fill in the values in `.env`:

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL (e.g. `http://localhost:8080`) |
| `VITE_BOT_USERNAME` | Telegram bot username without `@` (e.g. `my_ads_bot`) |

3. Install dependencies and run:

```bash
npm install
npm run dev
```

---

## Screens & API Methods

### Tab Bar

The app has 4 bottom tabs: **Marketplace**, **Campaigns**, **Channels**, **Profile**.

---

### 1. Marketplace (tab: `marketplace`)

Displays listed channels available for advertising.

| Action | API Method | Endpoint |
|---|---|---|
| Load channels list | `POST` | `/v1/channels?page={page}&size={size}` |

- **Filters button** — opens a sheet to filter channels by subscribers, price (TON), language. Applies filters and reloads the list via the same `POST /v1/channels` endpoint.
- **Channel item click** — opens a detail sheet with channel info (avatar, title, username, description, public/private status).

---

### 2. Campaigns (tab: `campaigns`)

Contains two sub-tabs: **All Campaigns** and **My Campaigns**.

#### Sub-tab: All Campaigns

| Action | API Method | Endpoint |
|---|---|---|
| Load all marketplace campaigns | `GET` | `/v1/campaigns/marketplace?page={page}&size={size}` |

- **Campaign item click** — opens a detail sheet with campaign info (title, status, budget, subscribers range, avg views, price range, languages).

#### Sub-tab: My Campaigns

| Action | API Method | Endpoint |
|---|---|---|
| Load my campaigns | `GET` | `/v1/campaigns/my?page={page}&size={size}` |
| Create a new campaign | `POST` | `/v1/campaigns/create` |

- **Campaign item click** — opens a detail sheet with campaign info. Inside, you can view responses (applications) to the campaign, open each response to see its details, and accept or reject it.
- **"+" FAB button** (bottom-right) — opens a "Create Campaign" sheet with fields: title, summary, budget, target subscribers, avg views, price range, language. Submits via `POST /v1/campaigns/create`.

---

### 3. Channels (tab: `channels`)

Displays channels owned by the current user.

| Action | API Method | Endpoint |
|---|---|---|
| Load my channels | `GET` | `/v1/channels/me?page={page}&size={size}` |
| List channel to marketplace | `POST` | `/v1/channels/{channelId}/listing` |

- **"Add Bot" button** — opens Telegram deep link to add the bot to a channel (`tg://...?startgroup&admin=post_messages`).
- **Channel item click** — opens a detail sheet with:
  - Channel info (avatar, title, username, description, public/private).
  - **"List to Marketplace"** form: listing description, ad format type, price (TON). Submits via `POST /v1/channels/{channelId}/listing`.

---

### 4. Profile (tab: `profile`)

User profile screen with logout functionality.

---

### Auth (login screen)

Shown when the user is not authenticated.

| Action | API Method | Endpoint |
|---|---|---|
| Authenticate via Telegram | `POST` | `/v1/auth/telegram` |
| Refresh tokens | `POST` | `/v1/auth/refresh` |

---
