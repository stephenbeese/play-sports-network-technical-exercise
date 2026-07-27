import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from a project path on GitHub Pages; "/" everywhere else.
  base: process.env.GITHUB_PAGES ? '/play-sports-network-technical-exercise/' : '/',
  plugins: [react(), tailwindcss()],
})
