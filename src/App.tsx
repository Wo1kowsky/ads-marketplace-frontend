import { useAuth } from "./hooks/useAuth";
import { LoginPage } from "./pages/LoginPage";
import { AppLayout } from "./components/AppLayout";

export function App() {
  const { isAuthenticated, loading, error, login } = useAuth();

  const handleRetry = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initData) {
      login(tg.initData);
    }
  };

  if (!isAuthenticated) {
    return <LoginPage loading={loading} error={error} onRetry={handleRetry} />;
  }

  return <AppLayout />;
}
