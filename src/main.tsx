import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, ToastProvider } from "@telegram-tools/ui-kit";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import "@telegram-tools/ui-kit/dist/index.css";
import { App } from "./App";

window.Telegram?.WebApp?.ready();
window.Telegram?.WebApp?.expand();

const manifestUrl = new URL("/tonconnect-manifest.json", window.location.origin).toString();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <ThemeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </TonConnectUIProvider>
  </StrictMode>,
);
