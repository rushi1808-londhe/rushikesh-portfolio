-- ============================================================
-- V10: Bucket list, shown on its own public page (/bucketlist) and ordered from the admin panel.
-- ============================================================
CREATE TABLE bucket_list_items (
    id             BIGSERIAL PRIMARY KEY,
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    done           BOOLEAN      NOT NULL DEFAULT FALSE,
    completed_on   VARCHAR(40),
    display_order  INT          NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
