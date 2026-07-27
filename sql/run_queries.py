import os
import sys
from pathlib import Path

import duckdb

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SQL = PROJECT_ROOT / "sql" / "queries.sql"


def main() -> None:
    sql_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SQL
    if not sql_path.is_absolute():
        sql_path = PROJECT_ROOT / sql_path

    if not sql_path.exists():
        sys.exit(f"SQL file not found: {sql_path}")

    sql_text = sql_path.read_text()

    statements = [s.strip() for s in sql_text.split(";") if s.strip()]

    os.chdir(PROJECT_ROOT)
    for i, statement in enumerate(statements, start=1):
        print(f"\n=== Query {i} of {len(statements)} ===")
        duckdb.sql(statement).show(max_rows=20)


if __name__ == "__main__":
    main()
