import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['tunnel5173.eigensol.com','4355443b2160.ngrok-free.app'],
    host: true,
    port: 5173,
  },
})
