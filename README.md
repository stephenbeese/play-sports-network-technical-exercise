# Play Sports Network - Technical Exercise

An end-to-end project that takes raw video performance data, cleans with Python, queries with SQL and displays the data in a fully responsive and interactive React dashboard.

**At a glance:** React 19 · TypeScript · Vite · Tailwind CSS v4 · Recharts · DuckDB · pandas

![Dashboard screenshot](/images/screenshot.png)

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
    - [Tests](#tests)
  - [Things I'd improve with more time](#things-id-improve-with-more-time)
  - [AI \& Tooling reflection](#ai--tooling-reflection)



## What I built

The exercise is split into two main parts:

### 1. Data pipeline & SQL analysis

- **ETL** (`jupyter_notebook/etl.ipynb`) - loads the raw CSVs from `data/raw`, cleans and type-casts them (dates, numerics, text), and writes tidy outputs to `data/processed`. I used the `Python` library `Pandas` to perform this Extract, Transform, Load pipeline. This was mainly to ensure the data was clean and the data types were consistent so I could easily perform calculations and analyse the data in the frontend.
- **SQL queries** ([sql/queries.sql](sql/queries.sql), run via `sql/run_queries.py`) - analytical queries executed against the processed CSVs with [DuckDB](https://duckdb.org/). They answer the three questions from the brief: total views per video, views by video type over time, and the top 5 videos by views in the past 28 days.
- **Frontend data build** (`sql/build_frontend_data.py`) - reshapes the processed tables into two JSON files so I could easily work with them via the React app.

> Note: the brief's `estimated_minutes_watched` field is carried through the pipeline as `watchtime` (in minutes).



### 2. Interactive dashboard

A fully responsive single-page React app (`src/`) that loads the two JSON files, joins posts to their daily stats, and lets you explore the catalogue.

The main features include:

- **KPI cards** - four headline metrics (total views, estimated watch time, engagements, and active videos) with a colour accent per card. Values recalculate live from the currently filtered set, and the "active videos" card also shows how many videos matched the filters.
- **Video table** - a ranked "editorial leaderboard" of every video with lifetime totals. Each row shows a lazy-loaded thumbnail with a duration overlay, a title that links out to the original video, the channel, a colour-coded format badge, views / engagements / estimated watch time, and an average % watched (watch time over the maximum possible for the views). Every metric column - including average % watched - is sortable by clicking its header (toggles ascending/descending) or via the dedicated **Rank by** and **Order** dropdowns, with continuous rank numbering across pages.
- **Pagination** - choose the number of rows per page, step through with Previous/Next, and see a "showing X–Y of Z videos" summary. Only the current page is rendered, so a large catalogue stays fast.
- **Charts tab** - six responsive [Recharts](https://recharts.org/) visualisations that all respond to the active filters. Views over time (area), engagements over time (line), top 10 videos by views (horizontal bar), views by channel (horizontal bar), estimated watch time by channel (bar), and a video-count-by-format (donut). Custom themed tooltips, compact axis formatting, and an empty state when filters match nothing.
- **Filters** - free-text search across title and channel with a keyboard-accessible autocomplete dropdown (arrow keys, Enter, Escape), channel and format dropdowns, and a published-date range whose bounds are derived from the data. All filters compose and drive both the table and the charts, with a one-click reset that's disabled when nothing is applied.
- **Theming** - five built-in palettes (Light, Dark, Ocean, Forest, Sunset) via a header theme switcher. The choice is persisted to `localStorage` and the initial theme respects the OS `prefers-color-scheme` setting.
- **Animations** - subtle motion (via [Motion](https://motion.dev/)) that guides attention without getting in the way: KPI cards fade and drift up with a staggered entrance, tab switches cross-fade, table rows and the search autocomplete animate in and out, buttons respond to hover/press, and the charts draw in on load. Theme changes ease smoothly between colours, and every animation is disabled automatically for users with the OS `prefers-reduced-motion` setting.
- **Polish** - fully responsive layout, tabular-aligned numbers, human-friendly number/duration/date formatting, and explicit loading and error states with a cancellable (`AbortController`) data fetch.



## Project structure

```
data/                 raw and processed CSVs
jupyter_notebook/     etl.ipynb — cleaning pipeline
sql/                  queries.sql + Python runners
public/data/          posts.json & poststats.json consumed by the UI
src/                  React app (components, hooks, helpers)
```



## Key decisions & trade-offs

- **DuckDB over the CSVs** — real SQL with zero setup, at the cost of no persistence.
- **Pre-computed JSON mirroring the cleaned tables** — simple and debuggable, but ships every daily row.
- **Client-side join & aggregation** (`useVideoData`) — instant to iterate on, doesn't scale ([see below](#things-id-improve-with-more-time)).
- **Filter options derived from the data** (`useFilterOptions`) — so they can't drift out of sync with the rows.
- **Small, composable hooks** keeping `App.tsx` a thin wiring layer.
- **Client-side pagination** (`usePagination`) — renders only the current page, so a large catalogue stays fast to render and easy to scan, improves scalability.
- **Resilient loading** — `AbortController` plus explicit loading/error states.
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

- `public/data/posts.json` — one record per video (`video_id`, `account_name`, `published_at_date`, `video_url`, `video_type`, `title`, `video_length`, `thumbnail_url`).
- `public/data/poststats.json` — daily stats, one record per row (`video_id`, `data_date`, `likes`, `comments`, `shares`, `views`, `watchtime`).

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



### Tests

Three layers, sharing one deterministic fixture in `tests/fixtures/`: **unit** (Vitest) for the formatting helpers and derivation hooks, **integration** (Vitest + React Testing Library) rendering the wired-up `App` against a mocked `fetch`, and **end-to-end** (Playwright) driving real user flows in Chromium against a production build.

```bash
yarn test                          # unit + integration (jsdom, no browser)
yarn playwright install chromium   # one-time browser download for E2E
yarn test:e2e                      # end-to-end (builds and previews automatically)
```

> If Playwright complains the browser executable is missing, re-run `yarn playwright install chromium`. The `yarn test` suite is unaffected and runs anywhere.



## Things I'd improve with more time

- **Push aggregation to the data layer.** `poststats.json` is shipped as a ~20MB row-per-record array and loaded entirely in the browser, where the join and all aggregations happen client-side. That's fine for a local exercise, but it doesn't scale well. I'd serve the data through a small API so filtering and grouping run on demand instead of loading the full dataset up front.
- **Wire the tests into CI.** Integration (Vitest) and end-to-end (Playwright) suites now exist (see [Tests](#tests)); the next step is running them, alongside type-checking and linting, as Pull Request checks so nothing that breaks the build can land on `main`. This matters especially once multiple developers are working on the project.
- **BDD/ATDD approach.** If I had more time I would have employed a BDD (Behaviour Driven Development) or an ATDD (Acceptance Testing Driven Development) approach. Using either of these approaches with using a red, green refactor methodology for tests I would have built a much more robust and production ready application. Writing code this way ensures the outcomes are well defined before the code is implemented. This approach helps later on in development ensuring that the intended functionality is preserved when iterating and adding new features and refactoring.
- **AI chatbot.** A natural-language assistant so users could ask questions like "which channel had the most watch time last month?" or "show me the top 5 shorts by engagement" instead of manually driving the filters. The cleanest approach would be a small backend endpoint that takes the user's question plus the current filter context, uses an LLM to translate it into a structured query (e.g. a SQL statement run against DuckDB, or a call into the existing aggregation layer), and returns both a short written answer and a chart/table. Keeping the LLM as a text-to-query translator keeps answers accurate and auditable, and the results could reuse the same Recharts components already in the dashboard.

## AI & Tooling reflection

**Did I use AI tools?** Yes.

**What for?** I used **Cursor** (with its built-in models) throughout as a pair programmer. It helped substantially with:

- Rapid iteration and boilerplate heavy tasks through code generation, this allowed me to focus on design decisions and useful features.
- Scaffolding the React components and wiring up the filter/sort/pagination state.
- Quick sanity checks and refactors (e.g. deriving filter options from the data rather than hard-coding them).

It got most things right first time, but I still reviewed and tested everything rather than taking it on trust - type-checking, ESLint and the test suite made that easier.

**Did it change how I worked?** Yes. It sped development up a lot, especially the boilerplate and getting a first version of each feature working. That left me more time for the data-modelling and UX decisions. I steered it closely and reviewed everything it produced. I find it works best when you clearly define the requirements and specifications in detail: the AI can then create a detailed plan and gather better context, allowing for more rapid iteration. Doing this helped me build a well-rounded application given the time constraints of this project.
