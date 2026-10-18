-- ============================================================
-- V3: Admin hardening + customisable skill logos and hero code
-- ============================================================

-- Skill logos chosen in the admin panel (Iconify icon JSON) or uploaded images.
ALTER TABLE skills ADD COLUMN icon_data TEXT;
ALTER TABLE skills ADD COLUMN icon_url  VARCHAR(500);

-- Text shown in the hero's code-editor window (NULL = generated from portfolio data).
ALTER TABLE profile ADD COLUMN hero_code TEXT;

-- Brute-force protection and audit trail for the admin account.
ALTER TABLE admin_users ADD COLUMN failed_attempts INT          NOT NULL DEFAULT 0;
ALTER TABLE admin_users ADD COLUMN locked_until    TIMESTAMPTZ;
ALTER TABLE admin_users ADD COLUMN last_login_at   TIMESTAMPTZ;
ALTER TABLE admin_users ADD COLUMN last_login_ip   VARCHAR(64);
