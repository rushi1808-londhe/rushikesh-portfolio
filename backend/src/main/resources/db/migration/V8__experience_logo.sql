-- ============================================================
-- V8: Company logo per experience (editable in the admin panel).
-- The SBFC logo is bundled in the backend (classpath:seed-uploads) and copied into the
-- uploads volume at startup (SeedUploadsInitializer). Only entries without a logo get it.
-- ============================================================
ALTER TABLE experiences ADD COLUMN logo_url VARCHAR(500);

UPDATE experiences SET logo_url = '/uploads/seed-sbfc-logo.jpg'
WHERE company LIKE 'SBFC%' AND logo_url IS NULL;
