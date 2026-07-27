import { test as base, type Page } from '@playwright/test'
import { posts, poststats } from '../fixtures/videoData'

async function stubData(page: Page) {
  await page.route('**/data/posts.json', (route) =>
    route.fulfill({ json: posts }),
  )
  await page.route('**/data/poststats.json', (route) =>
    route.fulfill({ json: poststats }),
  )
}

export const test = base.extend({
  page: async ({ page }, runTest) => {
    await stubData(page)
    await runTest(page)
  },
})

export { expect } from '@playwright/test'
