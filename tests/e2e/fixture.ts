import { test as base, type Page } from '@playwright/test'
import { posts, poststats } from '../fixtures/videoData'

/** Fulfils the app's two data requests with the shared fixture. */
async function stubData(page: Page) {
  await page.route('**/data/posts.json', (route) =>
    route.fulfill({ json: posts }),
  )
  await page.route('**/data/poststats.json', (route) =>
    route.fulfill({ json: poststats }),
  )
}

/**
 * Extends Playwright's `page` so the fixture is installed before any navigation.
 * Keeps E2E runs deterministic and independent of the real committed data.
 */
export const test = base.extend({
  // `runTest` is Playwright's fixture callback (passed positionally). It is named
  // to avoid the React `use` hook that the react-hooks lint rule would flag.
  page: async ({ page }, runTest) => {
    await stubData(page)
    await runTest(page)
  },
})

export { expect } from '@playwright/test'
