-- ============================================================
-- V5: Explicit project tech tags (previously auto-detected from the description).
-- Only fills projects that have no tags yet, so admin edits are never overwritten.
-- ============================================================
INSERT INTO project_tags (project_id, name, display_order)
SELECT p.id, t.name, t.ord
FROM projects p
JOIN (VALUES ('eSociety%', 'JWT', 1), ('UrbanInn%', 'REST APIs', 1)) AS t(pattern, name, ord) ON p.name LIKE t.pattern
WHERE NOT EXISTS (SELECT 1 FROM project_tags pt WHERE pt.project_id = p.id);
