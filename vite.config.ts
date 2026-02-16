import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Разрешает доступ по внешнему IP
    port: 5173,  // Убедитесь, что используется правильный порт
    strictPort: true,
    allowedHosts: true,
    hmr: {
      // домен, по которому к вам будут обращаться
      host: 'cleanly-blessed-boxer.ngrok-free.app',
      // если ngrok использует защищённый протокол
      protocol: 'wss',
      // порт для WS (для wss обычно 443)
      clientPort: 443,
      // при необходимости можно указать путь
      // path: '/__vite_hmr'
    }// Разрешает все внешние хосты
  }
})
