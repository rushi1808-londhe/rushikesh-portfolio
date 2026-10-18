-- ============================================================
-- V1: Portfolio schema
-- ============================================================

CREATE TABLE profile (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(120)  NOT NULL,
    title         VARCHAR(160)  NOT NULL,
    tagline       VARCHAR(255),
    location      VARCHAR(160),
    phone         VARCHAR(40),
    email         VARCHAR(160),
    summary       TEXT,
    speech_lines  TEXT,
    resume_url    VARCHAR(500),
    avatar_url    VARCHAR(500),
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE experiences (
    id             BIGSERIAL PRIMARY KEY,
    company        VARCHAR(160) NOT NULL,
    role           VARCHAR(160) NOT NULL,
    duration       VARCHAR(80)  NOT NULL,
    location       VARCHAR(160),
    display_order  INT          NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE experience_bullets (
    id             BIGSERIAL PRIMARY KEY,
    experience_id  BIGINT NOT NULL REFERENCES experiences (id) ON DELETE CASCADE,
    content        TEXT   NOT NULL,
    display_order  INT    NOT NULL DEFAULT 0
);
CREATE INDEX idx_experience_bullets_experience ON experience_bullets (experience_id);

CREATE TABLE projects (
    id                 BIGSERIAL PRIMARY KEY,
    name               VARCHAR(160) NOT NULL,
    short_description  TEXT         NOT NULL,
    full_description   TEXT,
    github_url         VARCHAR(500),
    live_url           VARCHAR(500),
    image_url          VARCHAR(500),
    display_order      INT          NOT NULL DEFAULT 0,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE project_tags (
    id             BIGSERIAL PRIMARY KEY,
    project_id     BIGINT      NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    name           VARCHAR(80) NOT NULL,
    display_order  INT         NOT NULL DEFAULT 0
);
CREATE INDEX idx_project_tags_project ON project_tags (project_id);

CREATE TABLE project_bullets (
    id             BIGSERIAL PRIMARY KEY,
    project_id     BIGINT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    content        TEXT   NOT NULL,
    display_order  INT    NOT NULL DEFAULT 0
);
CREATE INDEX idx_project_bullets_project ON project_bullets (project_id);

CREATE TABLE skills (
    id             BIGSERIAL PRIMARY KEY,
    name           VARCHAR(80)  NOT NULL,
    category       VARCHAR(80)  NOT NULL,
    display_order  INT          NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_skills_category ON skills (category);

CREATE TABLE certificates (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    issuer          VARCHAR(160),
    issue_date      VARCHAR(40),
    credential_url  VARCHAR(500),
    image_url       VARCHAR(500),
    description     TEXT,
    display_order   INT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE extracurriculars (
    id             BIGSERIAL PRIMARY KEY,
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    image_url      VARCHAR(500),
    event_date     VARCHAR(40),
    display_order  INT          NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE social_links (
    id             BIGSERIAL PRIMARY KEY,
    platform       VARCHAR(60)  NOT NULL,
    url            VARCHAR(500) NOT NULL,
    icon           VARCHAR(60),
    display_order  INT          NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE contact_messages (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    email       VARCHAR(160) NOT NULL,
    message     TEXT         NOT NULL,
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_contact_messages_created ON contact_messages (created_at DESC);

CREATE TABLE admin_users (
    id             BIGSERIAL PRIMARY KEY,
    username       VARCHAR(80)  NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    role           VARCHAR(40)  NOT NULL DEFAULT 'ADMIN',
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
