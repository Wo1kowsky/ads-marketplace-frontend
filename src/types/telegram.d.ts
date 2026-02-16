interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
    };
  };
  ready(): void;
  expand(): void;
  close(): void;
  openTelegramLink(url: string): void;
  colorScheme: "light" | "dark";
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
