import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// React Testing Library mounts into a shared document; unmount between tests so
// each case starts from a clean DOM.
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

// jsdom doesn't implement matchMedia, which useTheme falls back to when no
// data-theme attribute is present. Provide a light-mode stub.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}
