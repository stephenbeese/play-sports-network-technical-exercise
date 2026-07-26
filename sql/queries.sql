-- Total views per video
-- poststats holds one row per video per day, so we sum the daily views
-- to get the cumulative total for each video, joined to posts for context.
-- Reads the processed CSVs directly via DuckDB (run from the project root).
WITH posts AS (
    SELECT * FROM read_csv_auto('data/processed/posts_cleaned.csv')
),
poststats AS (
    SELECT * FROM read_csv_auto('data/processed/poststats_cleaned.csv')
)
SELECT
    p.video_id,
    p.title,
    p.account_name,
    SUM(ps.views) AS total_views
FROM poststats ps
JOIN posts p ON p.video_id = ps.video_id
GROUP BY p.video_id, p.title, p.account_name
ORDER BY total_views DESC;
