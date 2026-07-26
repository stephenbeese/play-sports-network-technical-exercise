import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Vitest runs the integration suite in a jsdom browser-like environment. E2E
// specs under tests/e2e are owned by Playwright and excluded here so the two
// runners never pick up each other's files.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['tests/setup.ts'],
    include: ['tests/{unit,integration}/**/*.test.{ts,tsx}'],
    css: false,
  },
})
