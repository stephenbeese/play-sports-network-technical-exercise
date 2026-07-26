# Play Sports Network - Technical Exercise

An end-to-end project that takes raw video performance data, cleans with Python, queries with SQL and displays the data in a fully responsive and interactive React dashboard.

**At a glance:** React 19 · TypeScript · Vite · Tailwind CSS v4 · Recharts · DuckDB · pandas

![The dashboard shown at mobile, tablet and desktop widths](/images/screenshot.png)

## What I built

The exercise is split into two main parts:

### 1. Data pipeline & SQL analysis

- **ETL** (`jupyter_notebook/etl.ipynb`) — loads the raw CSVs from `data/raw`,
cleans and type-casts them (dates, numerics, text), and writes tidy outputs to
`data/processed`. I used the `Python` library `Pandas` to perform this Extract, Transform, Load pipeline. This was mainly to ensure the data was clean and the data types were consistent so I could easily perform calculations and analyse the data in the frontend.
- **SQL queries** (`sql/queries.sql`, run via `sql/run_queries.py`) — analytical
queries executed against the processed CSVs with [DuckDB](https://duckdb.org/). They answer:
  1. Total views per video.
  2. Views by video type over time.
  3. Top 5 videos by views in the trailing 28 days.
- **Frontend data build** (`sql/build_frontend_data.py`) — reshapes the processed tables into two JSON files so I could easily work with them via the React app.

### 2. Interactive dashboard

A fully responsive single-page React app (`src/`) that loads the two JSON files, joins posts to
their daily stats, and lets you explore the catalogue.

The main features include:

- **KPI cards** — headline totals (views, engagements, watch time, and active videos) that
react to the current filters.
- **Video table** — sortable, paginated table of every video with lifetime
totals. Sort by any metric, choose page size, page through results.
- **Charts tab** — time-series of views/engagements and breakdowns by format,
built with [Recharts](https://recharts.org/).
- **Filters** — free-text search (title/channel) with suggestions, channel and
video-type dropdowns, and a publish-date range. All filters compose and drive
both the table and the charts, with a one-click reset.
- **Polish** — responsive layout, light/dark support, loading and error states.

**Tech stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Recharts on the
frontend; Python, pandas/Jupyter and DuckDB for the data layer.

## How to run the project

There are two independent halves. To just see the dashboard, jump to
[Frontend dashboard](#frontend-dashboard) — the processed data and JSON files are already committed.

### Data pipeline (Python)

Create and activate a virtual environment, then install the dependencies (pinned
versions live in `requirements.txt`). On Windows, use `python` where the commands
below say `python3`.

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

The processed outputs (`posts_cleaned.csv`, `poststats_cleaned.csv`) are already
committed, so you can skip this unless you want to regenerate them.

#### 2. Run the SQL queries

```bash
python3 sql/run_queries.py            # runs sql/queries.sql by default
python3 sql/run_queries.py path.sql   # or point it at another .sql file
```

The script `cd`s to the project root, splits the file on `;`, and prints each
statement's result.

#### 3. Build the frontend data files

```bash
python3 sql/build_frontend_data.py
```

This writes:

- `public/data/posts.json` — one record per video (`video_id`, `account_name`,
`published_at_date`, `video_url`, `video_type`, `title`, `video_length`,
`thumbnail_url`).
- `public/data/poststats.json` — daily stats, one record per row (`video_id`,
`data_date`, `likes`, `comments`, `shares`, `views`, `watchtime`).

Re-run this whenever the processed CSVs change.

### Frontend dashboard

Requires Node.js 20.19+ (or 22.12+) — needed by Vite 8 and Tailwind CSS v4.
Install dependencies and start the dev server:

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

> Uses Yarn (a `yarn.lock` is committed), but `npm install` / `npm run dev` work
> equally well if you prefer npm.

### Tests

Three complementary layers. The integration and E2E suites share one small,
deterministic fixture in `tests/fixtures/`, so assertions stay meaningful
without being brittle:

- **Unit** ([Vitest](https://vitest.dev/)) — the pure logic in isolation:
formatting helpers (`format.ts`) and the derivation hooks (`useChartData`,
`useVideoFilters`, `usePagination`, `useFilterOptions`), focused on boundaries
and edge cases.
- **Integration** (Vitest + React Testing Library) — render the wired-up `App`
against a mocked `fetch` and exercise the data join, filtering, sorting,
pagination, reset, the charts tab and the error state.
- **End-to-end** ([Playwright](https://playwright.dev/)) — drive real user flows
in Chromium against a production build, with the same fixture served via network
interception (so the 20MB data files are never needed).

**Unit + integration (Vitest)** — fast, runs in jsdom, no browser required:

```bash
yarn test          # run once (unit + integration)
yarn test:watch    # watch mode while developing
```

**End-to-end (Playwright)** — `yarn test:e2e` automatically builds the app and
starts `vite preview` (via the `webServer` config), so you don't need a dev
server running separately:

```bash
yarn playwright install chromium   # one-time browser download
yarn test:e2e                      # run the E2E suite
```

Handy Playwright variants:

```bash
yarn test:e2e --ui                 # interactive UI mode
yarn test:e2e tests/e2e/dashboard.spec.ts   # a single spec file
```

> The E2E browser must match your machine's native architecture. If you see an
> error like `Executable doesn't exist at .../chrome-headless-shell-mac-x64`,
> re-run `yarn playwright install chromium` from a normal terminal and try
> again. The integration suite (`yarn test`) is unaffected and runs anywhere.

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

## Things I'd improve with more time

- **Push aggregation to the data layer.** `poststats.json` is shipped as a ~20MB
row-per-record array and loaded entirely in the browser, where the join and all
aggregations happen client-side. That's fine for a local exercise, but it doesn't
scale well. I'd serve the data through a small API so filtering and grouping run
on demand instead of loading the full dataset up front.
- **Wire the tests into CI.** Integration (Vitest) and end-to-end (Playwright)
suites now exist (see [Tests](#tests)); the next step is running them, alongside
type-checking and linting, as Pull Request checks so nothing that breaks the
build can land on `main`. This matters especially once multiple developers are
working on the project.
- **BDD/ATDD approach.** If I had more time I would have employed a BDD (Behaviour Driven Development) or an ATDD (Acceptance Testing Driven Development) approach. Using either of these approaches with using a red, green refactor methodology for tests I would have built a much more robust and production ready application. Writing code this way ensures the outcomes are well defined before the code is implemented. This approach helps later on in development ensuring that the intended functionality is preserved when iterating and adding new features and refactoring.

## AI & Tooling reflection

**Did I use AI tools?** Yes.

**What for?** I used **Cursor** (with its built-in models) throughout as a pair
programmer. It helped substantially with:

- Rapid iteration and boilerplate heavy tasks through code generation, this allowed me to focus on design decisions and useful features.
- Scaffolding the React components and wiring up the filter/sort/pagination state.
- Quick sanity checks and refactors (e.g. deriving filter options from the data
rather than hard-coding them).

**Did it change how I worked?** Yes, it sped the development of this app up noticeably, especially on
boilerplate and on getting a first working version of each piece down quickly. This meant
I could spend more of my time on the data modelling decisions and on the overall
UX. I heavily steered the AI on design choices and overall project plan and implementation reviewing and
editing code it produced. For me AI works best when you define the requirements and specifications in detail, the AI can then create a detailed plan around these requirements. Which then helps the AI gather a better context around the outcomes of your prompt allowing for a more rapid iteration. Doing this helped substantially, especially given the time constraints of this project.