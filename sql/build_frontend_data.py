"""
Build the JSON data files the frontend reads directly.

Reuses the DuckDB-over-CSV pattern from sql/run_queries.py: the processed CSVs
are queried in place and the results are written to public/data/ as JSON that
mirrors the source tables.

Outputs:
    public/data/posts.json     one record per video (mirrors posts_cleaned.csv,
                               dropping the heavy free-text `text` field the UI
                               never uses).
    public/data/poststats.json daily stats, one record per row
                               (mirrors poststats_cleaned.csv).

The frontend derives the channel list, video-type list, and min/max dates from
these two files, so no separate meta file is emitted.

Usage:
    python sql/build_frontend_data.py
"""

import os
from pathlib import Path

import duckdb

# Project root is the parent of this script's directory (sql/).
PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "data"

POSTS_SQL = """
COPY (
    SELECT
        video_id,
        account_name,
        published_at_date,
        video_url,
        video_type,
        title,
        video_length,
        thumbnail_url
    FROM read_csv_auto('data/processed/posts_cleaned.csv')
    ORDER BY published_at_date
) TO '{out}' (FORMAT JSON, ARRAY true);
"""

POSTSTATS_SQL = """
COPY (
    SELECT
        video_id,
        data_date,
        likes,
        comments,
        shares,
        views,
        watchtime
    FROM read_csv_auto('data/processed/poststats_cleaned.csv')
    ORDER BY data_date, video_id
) TO '{out}' (FORMAT JSON, ARRAY true);
"""


def main() -> None:
    # Run from the project root so the relative CSV paths resolve.
    os.chdir(PROJECT_ROOT)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    posts_out = OUTPUT_DIR / "posts.json"
    poststats_out = OUTPUT_DIR / "poststats.json"

    duckdb.sql(POSTS_SQL.format(out=posts_out.as_posix()))
    posts_count = duckdb.sql(
        "SELECT COUNT(*) FROM read_json_auto('{p}')".format(p=posts_out.as_posix())
    ).fetchone()[0]
    print(f"Wrote {posts_count} records to {posts_out.relative_to(PROJECT_ROOT)}")

    duckdb.sql(POSTSTATS_SQL.format(out=poststats_out.as_posix()))
    poststats_count = duckdb.sql(
        "SELECT COUNT(*) FROM read_json_auto('{p}')".format(p=poststats_out.as_posix())
    ).fetchone()[0]
    print(
        f"Wrote {poststats_count} records to "
        f"{poststats_out.relative_to(PROJECT_ROOT)}"
    )


if __name__ == "__main__":
    main()
