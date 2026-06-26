-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Create locations table for student physical location tracking
-- Run this script against your logbook_db database before restarting the backend
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS locations (
    id           BIGINT         NOT NULL AUTO_INCREMENT,
    student_id   BIGINT         NOT NULL,
    latitude     DECIMAL(10, 8) NOT NULL,
    longitude    DECIMAL(11, 8) NOT NULL,
    address      TEXT,
    captured_at  DATETIME       NOT NULL,
    created_at   DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_location_student FOREIGN KEY (student_id)
        REFERENCES users (id)
        ON DELETE CASCADE
);

-- Index to quickly find the latest location per student
CREATE INDEX idx_locations_student_captured
    ON locations (student_id, captured_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Verification query — run after migration to confirm table exists
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT COUNT(*) FROM locations;
