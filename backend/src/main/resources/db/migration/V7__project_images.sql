-- ============================================================
-- V7: Multiple screenshots per project + real repository links.
-- Seed images are bundled in the backend (classpath:seed-uploads) and copied into the
-- uploads volume at startup (SeedUploadsInitializer). Only projects without images get them.
-- ============================================================
CREATE TABLE project_images (
    id             BIGSERIAL PRIMARY KEY,
    project_id     BIGINT       NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    url            VARCHAR(500) NOT NULL,
    caption        VARCHAR(160),
    display_order  INT          NOT NULL DEFAULT 0
);
CREATE INDEX idx_project_images_project ON project_images (project_id);

INSERT INTO project_images (project_id, url, caption, display_order)
SELECT p.id, s.url, s.caption, s.ord
FROM projects p
JOIN (VALUES
    ('eSociety%', '/uploads/seed-esociety-admin.jpg',       'Society Admin dashboard', 1),
    ('eSociety%', '/uploads/seed-esociety-resident.jpg',    'Resident dashboard',      2),
    ('eSociety%', '/uploads/seed-esociety-superadmin.jpg',  'Super Admin dashboard',   3),
    ('eSociety%', '/uploads/seed-esociety-login.jpg',       'Login',                   4),
    ('UrbanInn%', '/uploads/seed-urbaninn-admin.jpg',       'Hotel Admin dashboard',   1),
    ('UrbanInn%', '/uploads/seed-urbaninn-guest.jpg',       'Guest self-service portal', 2),
    ('UrbanInn%', '/uploads/seed-urbaninn-kitchen.jpg',     'Kitchen order queue',     3),
    ('UrbanInn%', '/uploads/seed-urbaninn-reception.jpg',   'Receptionist dashboard',  4),
    ('UrbanInn%', '/uploads/seed-urbaninn-superadmin.jpg',  'Super Admin dashboard',   5),
    ('UrbanInn%', '/uploads/seed-urbaninn-login.jpg',       'Login',                   6),
    ('TrendiFy%', '/uploads/seed-trendify-home.jpg',        'Storefront',              1),
    ('TrendiFy%', '/uploads/seed-trendify-admin.jpg',       'Admin dashboard',         2),
    ('TrendiFy%', '/uploads/seed-trendify-superadmin.jpg',  'Super Admin analytics',   3),
    ('TrendiFy%', '/uploads/seed-trendify-login.jpg',       'Login',                   4)
) AS s(pattern, url, caption, ord) ON p.name LIKE s.pattern
WHERE NOT EXISTS (SELECT 1 FROM project_images pi WHERE pi.project_id = p.id);

UPDATE projects SET github_url = 'https://github.com/rushi1808-londhe/eSociety'
WHERE name LIKE 'eSociety%' AND github_url = 'https://github.com/rushi1808-londhe';
UPDATE projects SET github_url = 'https://github.com/rushi1808-londhe/UrbanInn'
WHERE name LIKE 'UrbanInn%' AND github_url = 'https://github.com/rushi1808-londhe';
