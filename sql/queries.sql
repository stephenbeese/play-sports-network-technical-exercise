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

-- Video views by video type over time
-- Aggregates the daily views from poststats by the video_type from posts,
-- giving one row per (day, video_type) so trends per format can be compared.
WITH posts AS (
    SELECT * FROM read_csv_auto('data/processed/posts_cleaned.csv')
),
poststats AS (
    SELECT * FROM read_csv_auto('data/processed/poststats_cleaned.csv')
)
SELECT
    ps.data_date,
    p.video_type,
    SUM(ps.views) AS total_views
FROM poststats ps
JOIN posts p ON p.video_id = ps.video_id
GROUP BY ps.data_date, p.video_type
ORDER BY ps.data_date, p.video_type;

-- Top 5 videos by views in the past 28 days
-- Uses the latest data_date in poststats as the reference point, then sums the
-- daily views over the trailing 28-day window (inclusive) for each video.
WITH posts AS (
    SELECT * FROM read_csv_auto('data/processed/posts_cleaned.csv')
),
poststats AS (
    SELECT * FROM read_csv_auto('data/processed/poststats_cleaned.csv')
),
window_bounds AS (
    SELECT MAX(data_date) AS max_date FROM poststats
)
SELECT
    p.video_id,
    p.title,
    p.account_name,
    SUM(ps.views) AS views_last_28_days
FROM poststats ps
JOIN posts p ON p.video_id = ps.video_id
CROSS JOIN window_bounds wb
WHERE ps.data_date > wb.max_date - INTERVAL 28 DAY
GROUP BY p.video_id, p.title, p.account_name
ORDER BY views_last_28_days DESC
LIMIT 5;
