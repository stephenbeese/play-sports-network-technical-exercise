# Play Sports Network - Technical Exercise

## Data pipeline & SQL queries

The data workflow has two steps:

1. **ETL** (`jupyter_notebook/etl.ipynb`) — loads the raw CSVs from `data/raw`, cleans and type-casts them, and writes the processed files to `data/processed`.
2. **SQL queries** (`sql/run_queries.py`) — runs the analytical queries in `sql/queries.sql` against the processed CSVs using DuckDB.

### Prerequisites

Create and activate a virtual environment, then install the Python dependencies.

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

**Windows (Command Prompt):**

```cmd
python -m venv .venv
.venv\Scripts\activate.bat
pip install -r requirements.txt
```

### 1. Run the ETL notebook

The notebook reads from `data/raw` and writes the cleaned outputs to `data/processed`. Run it in either of the following ways.

Option A — run every cell from the command line:

```bash
jupyter nbconvert --to notebook --execute --inplace jupyter_notebook/etl.ipynb
```

Option B — open it interactively and run all cells top to bottom:

```bash
jupyter lab jupyter_notebook/etl.ipynb
# or
jupyter notebook jupyter_notebook/etl.ipynb
```

The first cells set the working directory to the project root, so the relative `data/` paths resolve regardless of where the kernel starts.

The processed outputs (`posts_cleaned.csv` and `poststats_cleaned.csv`) are already committed to `data/processed`, so you can skip straight to the SQL queries below if you just want to run them. Re-run the notebook only if you want to regenerate them from `data/raw`.

### 2. Run the SQL queries

Once the processed CSVs exist, run all queries in `sql/queries.sql`:

```bash
python3 sql/run_queries.py
```

To run a different `.sql` file, pass its path (absolute, or relative to the project root):

```bash
python3 sql/run_queries.py sql/queries.sql
```

The script changes to the project root before executing, splits the file on `;`, and prints the result of every statement in turn.
