import { Button, Text, Spinner } from "@telegram-tools/ui-kit";

interface LoginPageProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function LoginPage({ loading, error, onRetry }: LoginPageProps) {
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16 }}>
        <Spinner size="48px" color="primary" />
        <Text type="subheadline1">Authenticating...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16, padding: 24 }}>
        <Text type="title3">Authentication Error</Text>
        <Text type="body" align="center" color="secondary">{error}</Text>
        <Button text="Retry" onClick={onRetry} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16, padding: 24 }}>
      <Text type="title3">Ads Marketplace</Text>
      <Text type="body" align="center" color="secondary">
        Please open this app from Telegram to sign in.
      </Text>
    </div>
  );
}
