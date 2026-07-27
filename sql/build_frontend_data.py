import os
from pathlib import Path

import duckdb

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
