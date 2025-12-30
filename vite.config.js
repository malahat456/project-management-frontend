import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'  // ← یہ لائن شامل کریں

export default defineConfig({
  plugins: [react(), tailwindcss()],  // ← tailwindcss() یہاں add کریں
})