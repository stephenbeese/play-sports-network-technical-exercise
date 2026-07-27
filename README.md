# Play Sports Network - Technical Exercise

An end-to-end project that takes raw video performance data, cleans with Python, queries with SQL and displays the data in a fully responsive and interactive React dashboard.

**At a glance:** React 19 · TypeScript · Vite · Tailwind CSS v4 · Recharts · DuckDB · pandas

**Live demo:** [play-sports-network-technical-exerc.vercel.app](https://play-sports-network-technical-exerc.vercel.app/)

![Dashboard screenshot](/images/responsive.png)

## Table of contents

- [Play Sports Network - Technical Exercise](#play-sports-network---technical-exercise)
  - [Table of contents](#table-of-contents)
  - [What I built](#what-i-built)
    - [1. Data pipeline \& SQL analysis](#1-data-pipeline--sql-analysis)
    - [2. Interactive dashboard](#2-interactive-dashboard)
  - [Project structure](#project-structure)
  - [Key decisions \& trade-offs](#key-decisions--trade-offs)
  - [How to run the project](#how-to-run-the-project)
    - [Get the code](#get-the-code)
    - [Data pipeline (Python)](#data-pipeline-python)
      - [1. Run the ETL notebook](#1-run-the-etl-notebook)
      - [2. Run the SQL queries](#2-run-the-sql-queries)
      - [3. Build the frontend data files](#3-build-the-frontend-data-files)
    - [Frontend dashboard](#frontend-dashboard)
    - [Chat assistant](#chat-assistant)
      - [How the chatbot works](#how-the-chatbot-works)
    - [Deployment (Vercel)](#deployment-vercel)
    - [Tests](#tests)
  - [Things I'd improve with more time](#things-id-improve-with-more-time)
  - [AI \& Tooling reflection](#ai--tooling-reflection)

## What I built

The exercise is split into two main parts:

### 1. Data pipeline & SQL analysis

- **ETL** (`jupyter_notebook/etl.ipynb`) - a Python/pandas Extract, Transform, Load pipeline that loads the raw CSVs from `data/raw`, cleans and type-casts them (dates, numerics, text), and writes tidy outputs to `data/processed`, so the frontend gets clean, consistently typed data to calculate over.
- **SQL queries** ([sql/queries.sql](sql/queries.sql), run via `sql/run_queries.py`) - analytical queries executed against the processed CSVs with [DuckDB](https://duckdb.org/). They answer the three questions from the brief: total views per video, views by video type over time, and the top 5 videos by views in the past 28 days.
- **Frontend data build** (`sql/build_frontend_data.py`) - reshapes the processed tables into two JSON files so I could easily work with them via the React app.

> Note: the brief's `estimated_minutes_watched` field is carried through the pipeline as `watchtime` (in minutes).

### 2. Interactive dashboard

A fully responsive single-page React app (`src/`) that loads the two JSON files, joins posts to their daily stats, and lets you explore the catalogue.

The main features include:

- **KPI cards** - four headline metrics (total views, estimated watch time, engagements, and active videos) with a colour accent per card. Values recalculate live from the currently filtered set, and the "active videos" card also shows how many videos matched the filters.
- **Video table** - a ranked "editorial leaderboard" of every video with lifetime totals. Each row shows a lazy-loaded thumbnail (with duration overlay), a title linking to the original video, channel, a colour-coded format badge, views / engagements / estimated watch time, and average % watched. Every metric column is sortable via its header or the **Rank by** and **Order** dropdowns, with continuous rank numbering across pages.
- **Pagination** - choose the rows per page, step through with Previous/Next, and see a "showing X-Y of Z videos" summary. Only the current page is rendered, so a large catalogue stays fast.
- **Charts tab** - six responsive [Recharts](https://recharts.org/) visualisations that respond to the active filters: views over time (area), engagements over time (line), top 10 videos by views and views by channel (horizontal bars), watch time by channel (bar), and video count by format (donut). Themed tooltips, compact axes, and an empty state when nothing matches.
- **Filters** - free-text search across title and channel with a keyboard-accessible autocomplete (arrow keys, Enter, Escape), channel and format dropdowns, and a data-derived published-date range. All filters compose and drive both the table and charts, with a one-click reset that's disabled when nothing is applied.
- **Theming** - five built-in palettes (Light, Dark, Ocean, Forest, Sunset) via a header switcher, persisted to `localStorage`, with the initial theme respecting the OS `prefers-color-scheme` setting.
- **Animations** - subtle motion (via [Motion](https://motion.dev/)): staggered KPI card entrances, cross-fading tabs, animated table rows and autocomplete, hover/press feedback, and charts that draw in on load. All disabled automatically under the OS `prefers-reduced-motion` setting.
- **Polish** - fully responsive layout, tabular-aligned numbers, human-friendly number/duration/date formatting, and explicit loading and error states with a cancellable (`AbortController`) data fetch.
- **Chat assistant** - a floating chatbot that answers questions about the data ("top video by views", "which channel has the most watch time?"). It works with zero setup in demo mode, and upgrades to free-form answers via OpenAI when a key is supplied - see [Chat assistant](#chat-assistant).

## Project structure

```
data/                 raw and processed CSVs
jupyter_notebook/     etl.ipynb - cleaning pipeline
sql/                  queries.sql + Python runners
public/data/          posts.json & poststats.json consumed by the UI
src/                  React app (components, hooks, helpers)
```

## Key decisions & trade-offs

- **DuckDB over the CSVs** - real SQL with zero setup, at the cost of no persistence.
- **Pre-computed JSON mirroring the cleaned tables** - simple and debuggable, but ships every daily row.
- **Client-side join & aggregation** (`useVideoData`) - instant to iterate on, doesn't scale ([see below](#things-id-improve-with-more-time)).
- **Filter options derived from the data** (`useFilterOptions`) - so they can't drift out of sync with the rows.
- **Small, composable hooks** keeping `App.tsx` a thin wiring layer.
- **Client-side pagination** (`usePagination`) - renders only the current page, so a large catalogue stays fast to render and easy to scan, improves scalability.
- **Resilient loading** - `AbortController` plus explicit loading/error states.
- **Tailwind v4 CSS-variable theming** for light/dark without per-theme markup.

## How to run the project

There are two independent halves. To just see the dashboard, jump to [Frontend dashboard](#frontend-dashboard) - the processed data and JSON files are already committed.

### Get the code

Clone the repository (requires [Git](https://git-scm.com/downloads)) and move into it:

```bash
git clone https://github.com/stephenbeese/play-sports-network-technical-exercise.git
cd play-sports-network-technical-exercise
```

No Git? Download a ZIP instead from the repo's green **Code** button on [GitHub](https://github.com/stephenbeese/play-sports-network-technical-exercise), then unzip it. Run the remaining commands from a terminal in the project root.

### Data pipeline (Python)

Create and activate a virtual environment, then install the dependencies (pinned versions live in `requirements.txt`). On Windows, use `python` where the commands below say `python3`.

**macOS / Linux:**

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Windows (PowerShell):**

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

#### 1. Run the ETL notebook

Reads from `data/raw` and writes cleaned outputs to `data/processed`.

```bash
# run every cell headless
jupyter nbconvert --to notebook --execute --inplace jupyter_notebook/etl.ipynb

# or open interactively
jupyter lab jupyter_notebook/etl.ipynb
```

The processed outputs (`posts_cleaned.csv`, `poststats_cleaned.csv`) are already committed, so you can skip this unless you want to regenerate them.

#### 2. Run the SQL queries

```bash
python3 sql/run_queries.py            # runs sql/queries.sql by default
python3 sql/run_queries.py path.sql   # or point it at another .sql file
```

The script `cd`s to the project root, splits the file on `;`, and prints each statement's result.

#### 3. Build the frontend data files

```bash
python3 sql/build_frontend_data.py
```

This writes:

- `public/data/posts.json` - one record per video (`video_id`, `account_name`, `published_at_date`, `video_url`, `video_type`, `title`, `video_length`, `thumbnail_url`).
- `public/data/poststats.json` - daily stats, one record per row (`video_id`, `data_date`, `likes`, `comments`, `shares`, `views`, `watchtime`).

Re-run this whenever the processed CSVs change.

### Frontend dashboard

Requires Node.js 20.19+ (or 22.12+) - needed by Vite 8 and Tailwind CSS v4. Install dependencies and start the dev server:

```bash
yarn install
yarn dev
```

Then open the printed local URL (default [http://localhost:5173](http://localhost:5173)).

Other scripts:

```bash
yarn build     # type-check and produce a production build in dist/
yarn preview   # serve the production build locally
yarn lint      # run ESLint
```

> Uses Yarn (a `yarn.lock` is committed), but `npm install` / `npm run dev` work equally well if you prefer npm.

### Chat assistant

The chat bubble in the bottom-right corner works in three modes, picking the best one available:

- **Hosted OpenAI mode (the deployed site):** on the Vercel deployment, chat requests go through an edge function (`api/chat.ts`) that holds the OpenAI key server-side - so free-form questions work for every visitor with no setup and no key ever reaching the browser. Answers stream from `gpt-4o-mini` with the currently *filtered* video data provided as context, and the model is instructed to answer only from that data.
- **Demo mode (running locally, no setup):** common questions ("top video by views", "which channel has the most watch time?", "how many Shorts vs long-form?", "total engagements") are answered locally by computing over the same joined data that drives the dashboard. No network calls, no key, no cost.
- **Bring-your-own-key (running locally, optional):** for free-form questions without the deployed proxy, either paste an OpenAI API key into the panel (stored only in your browser's `localStorage`), or copy `.env.example` to `.env.local` and set `VITE_OPENAI_API_KEY`, then restart the dev server.

#### How the chatbot works

The design goal is **accuracy over cleverness** - every number the bot quotes must match what's on screen:

- **All aggregation happens in code, never in the model.** LLMs are unreliable at arithmetic over long lists - early versions that received the ~2,300 raw rows produced plausible-but-wrong totals. Instead the app precomputes an exact fact sheet (overall totals, per-channel/per-format/per-month rollups, top-15 lists) using the same joined data that drives the KPI cards and charts, and the model's only job is to pick the right precomputed number and narrate it. It's explicitly instructed never to do its own arithmetic and to say when a question falls outside the fact sheet rather than guess.
- **Demo mode is the same idea without the model:** a small intent matcher (`src/lib/localAnswers.ts`) routes common questions straight to those code computed aggregates, so the chatbot is fully usable with no key at all.
- **Filter awareness:** the bot answers over the currently *filtered* data (like everything else on the page), and prefixes answers with "Across your current filters…" when any filter is active so a filtered total is never mistaken for a global one.

**Security note:** a key must never be baked into a public build - any `VITE_` variable is readable in the shipped JavaScript. That's why the deployed site uses the edge proxy: the key lives in a Vercel environment variable and the OpenAI account carries a spend cap. The proxy also defends itself against direct callers (`api/chat.ts`):

- **The system prompt is injected server-side.** The browser sends only the precomputed fact sheet plus the user/assistant history; requests containing a `system` message are rejected. That means someone hitting `/api/chat` directly can't swap out the instructions and use the key as a free general-purpose OpenAI proxy.
- **Rate limiting uses the trusted client IP** (Vercel's `x-real-ip`, which callers can't spoof, rather than the client-controllable `x-forwarded-for`), and stale entries are evicted so the tracker can't grow unbounded.
- **Request sizes are capped** - message count, per-message length, and fact-sheet size - so a single oversized request can't run up the OpenAI bill.

The pasted-key path is for local review only. The shared prompt text lives in `src/lib/chatPrompt.ts` so the local bring-your-own-key path and the proxy stay in sync.

### Deployment (Vercel)

Live demo: [play-sports-network-technical-exerc.vercel.app](https://play-sports-network-technical-exerc.vercel.app/)

The site deploys to [Vercel](https://vercel.com/) as a Vite static build plus the `api/chat.ts` edge function (see [Chat assistant](#chat-assistant) for how the proxy works):

1. Import the GitHub repo in the Vercel dashboard. No `vercel.json` is needed - Vercel's Vite framework preset auto-detects the build command (`yarn build`) and output directory (`dist/`).
2. Add an `OPENAI_API_KEY` environment variable (Project → Settings → Environment Variables) to power the chat proxy.
3. Every push to `main` redeploys production, and every pull request gets its own preview deployment automatically.

### Tests

Three layers, sharing one deterministic fixture in `tests/fixtures/`: **unit** (Vitest) for the formatting helpers, derivation hooks, and the chat feature (the `api/chat.ts` proxy's validation and rate limiting, and the `useChat` hook's demo/proxy/streaming behaviour), **integration** (Vitest + React Testing Library) rendering the wired-up `App` against a mocked `fetch`, and **end-to-end** (Playwright) driving real user flows in Chromium against a production build.

```bash
yarn test                          # unit + integration 
yarn playwright install chromium   # one-time browser download for E2E
yarn test:e2e                      # end-to-end (builds and previews automatically)
yarn test:e2e --ui                 # end-to-end in Playwright's interactive UI mode
```

Playwright's **UI mode** (`yarn test:e2e --ui`) opens an interactive runner where you can watch tests execute in a live browser, step through each action with time-travel snapshots, inspect the DOM and network at any point, and re-run individual tests on save - handy for writing or debugging a flow.

> If Playwright complains the browser executable is missing, re-run `yarn playwright install chromium`. The `yarn test` suite is unaffected and runs anywhere.

## Things I'd improve with more time

- **Push aggregation to the data layer.** `poststats.json` is shipped as a ~20MB row-per-record array and loaded entirely in the browser, where the join and all aggregations happen client-side. That's fine for a local exercise, but it doesn't scale well. I'd serve the data through a small API so filtering and grouping run on demand instead of loading the full dataset up front.
- **Set up a backend.** Stand up a dedicated backend service (e.g. Node/Express or FastAPI) to own the data and expose the filtering/aggregation endpoints above. It would keep the DB queries server-side and give a single home for auth, caching and the chatbot's LLM calls, rather than leaning on the current Vercel edge function.
- **Adopt React Query.** Swap the hand-rolled `AbortController` fetch for [TanStack Query](https://tanstack.com/query) (React Query) to get caching, background refetching, request deduplication and consistent loading/error states out of the box - a natural fit once the data comes from real backend endpoints.
- **Add global state management.** For scalability I'd lift shared state (filters, theme, chat) out of `App.tsx` into a dedicated store (e.g. Zustand, Nanostores or a Context + reducer) so it isn't threaded through props and features stay decoupled and easier to test.
- **Wire the tests into CI.** Integration (Vitest) and end-to-end (Playwright) suites exist (see [Tests](#tests)); the next step is running them, alongside type-checking and linting, as Pull Request checks so nothing that breaks the build can land on `main`. This matters especially once multiple developers are working on the project.
- **BDD/ATDD approach.** With more time I'd adopt a BDD (Behaviour Driven Development) or ATDD (Acceptance Test Driven Development) workflow with a red-green-refactor cycle. Defining the expected outcomes through tests before writing the code makes for a more robust, production-ready application and preserves the intended behaviour as features are added and refactored.
- **Evolve the AI chatbot.** With the chatbot's current setup (see [Chat assistant](#chat-assistant)) it answers over a precomputed fact sheet, which keeps every number exact but limits the questions it can cover. The next step would be a small backend endpoint that uses the LLM as a text-to-query translator (e.g. generating SQL run against DuckDB, or calls into the existing aggregation layer), returning both a written answer and a chart/table reusing the dashboard's Recharts components. That keeps answers accurate and auditable while opening up arbitrary questions, and moves the OpenAI key server-side.

## AI & Tooling reflection

- **Did I use AI tools?** Yes - **Cursor** and **Claude** throughout, treated as tools I was driving rather than something building the project for me.
- **What did I use them for?** Mostly speed on the mechanical parts - boilerplate, scaffolding components, first drafts of each feature - which freed me up for the decisions that shape the app: the data modelling, the DuckDB and pre-computed JSON approach, the hooks-based dashboard, and the "accuracy over cleverness" chatbot (every number computed in code, key kept server-side). I reviewed, ran and tested everything it produced, with type-checking, ESLint and the test suite assisting with that.
- **Did they speed up or change how I worked?** Both. Noticeably faster on boilerplate and first versions, which left more time for the data and UX decisions, and it made me more deliberate about specifications. The clearer my requirements were, the better the output. I didn't take it on trust, for example, an early chatbot version let the model add up the raw data rows and it returned plausible-but-wrong totals, which is exactly why I moved all the calculations into code.

