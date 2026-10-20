-- ============================================================
-- V9: Explicit skills ("Stack") per experience, editable in the admin panel.
-- Entries without skills keep showing the stack auto-detected from their bullet points.
-- ============================================================
CREATE TABLE experience_skills (
    id             BIGSERIAL PRIMARY KEY,
    experience_id  BIGINT      NOT NULL REFERENCES experiences (id) ON DELETE CASCADE,
    name           VARCHAR(80) NOT NULL,
    display_order  INT         NOT NULL DEFAULT 0
);
CREATE INDEX idx_experience_skills_experience ON experience_skills (experience_id);
