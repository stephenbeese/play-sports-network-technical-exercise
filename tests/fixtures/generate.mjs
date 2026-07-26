// One-off generator for the deterministic test fixture.
// Run with `node tests/fixtures/generate.mjs`. The emitted posts.json and
// poststats.json are committed; this script exists only to keep the arithmetic
// (per-day splits, engagement inversions) verifiable and reproducible.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

const STAT_DATES = ['2025-06-01', '2025-06-02', '2025-06-03']

// video_id, channel, type, published, title, length(ms), daily view split,
// engagementBoost adds flat extra "shares" on day one so engagement ranking can
// diverge from view ranking (keeps the sort test meaningful, not tautological).
const VIDEOS = [
  ['v09', 'Gamma Rovers', 'Long-form', '2025-02-14', 'Gamma Documentary', 1200000, [200000, 180000, 120000], 0],
  ['v05', 'Beta United', 'Long-form', '2025-01-20', 'Beta Full Match', 900000, [180000, 140000, 100000], 0],
  ['v07', 'Beta United', 'Long-form', '2025-04-05', 'Beta Tactics Deep Dive', 810000, [150000, 120000, 90000], 0],
  ['v03', 'Alpha FC', 'Long-form', '2025-03-15', 'Alpha Match Analysis', 720000, [130000, 100000, 80000], 0],
  ['v01', 'Alpha FC', 'Long-form', '2025-01-05', 'Alpha Season Review', 600000, [120000, 90000, 70000], 0],
  ['v11', 'Gamma Rovers', 'Long-form', '2025-05-01', 'Gamma Interview Special', 660000, [100000, 80000, 60000], 0],
  ['v02', 'Alpha FC', 'Short', '2025-02-10', 'Alpha Top Goals', 45000, [80000, 60000, 50000], 0],
  // v10 is a Short with a big engagement boost: fewer views than several
  // long-form videos, but its total engagements outrank most of them.
  ['v10', 'Gamma Rovers', 'Short', '2025-03-30', 'Gamma Highlights', 50000, [70000, 50000, 40000], 300000],
  ['v06', 'Beta United', 'Short', '2025-02-25', 'Beta Best Saves', 40000, [60000, 40000, 30000], 0],
  ['v08', 'Beta United', 'Short', '2025-05-12', 'Beta Fan Reactions', 35000, [40000, 30000, 20000], 0],
  ['v04', 'Alpha FC', 'Short', '2025-06-20', 'Alpha Quick Skills', 30000, [30000, 20000, 10000], 0],
  ['v12', 'Gamma Rovers', 'Short', '2025-06-28', 'Gamma Training Clip', 25000, [15000, 10000, 5000], 0],
]

const posts = []
const poststats = []

for (const [id, channel, type, published, title, length, split, boost] of VIDEOS) {
  posts.push({
    video_id: id,
    account_name: channel,
    published_at_date: published,
    video_url: `https://videos.example.com/${id}`,
    video_type: type,
    title,
    video_length: length,
    thumbnail_url: `https://thumbs.example.com/${id}.jpg`,
  })

  split.forEach((views, dayIndex) => {
    poststats.push({
      video_id: id,
      data_date: STAT_DATES[dayIndex],
      likes: views / 100,
      comments: views / 500,
      shares: views / 1000 + (dayIndex === 0 ? boost : 0),
      views,
      watchtime: views * 2,
    })
  })
}

writeFileSync(join(here, 'posts.json'), JSON.stringify(posts, null, 2) + '\n')
writeFileSync(join(here, 'poststats.json'), JSON.stringify(poststats, null, 2) + '\n')

console.log(`Wrote ${posts.length} posts and ${poststats.length} daily stat rows.`)
