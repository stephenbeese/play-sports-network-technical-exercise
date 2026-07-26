"""
Run a .sql file against the processed data using DuckDB.

Usage:
    python sql/run_queries.py
    python sql/run_queries.py <path/to/file.sql>
"""

import os
import sys
from pathlib import Path

import duckdb

# Project root is the parent of this script's directory (sql/).
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SQL = PROJECT_ROOT / "sql" / "queries.sql"


def main() -> None:
    sql_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SQL
    if not sql_path.is_absolute():
        sql_path = PROJECT_ROOT / sql_path

    if not sql_path.exists():
        sys.exit(f"SQL file not found: {sql_path}")

    query = sql_path.read_text()

    # Run from the project root so the relative CSV paths in the query resolve.
    os.chdir(PROJECT_ROOT)
    duckdb.sql(query).show(max_rows=20)


if __name__ == "__main__":
    main()
