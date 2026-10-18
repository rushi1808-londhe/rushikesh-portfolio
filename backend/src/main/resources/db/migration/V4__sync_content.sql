-- ============================================================
-- V4: Bring seeded content in line with the content edited since V2,
-- so a fresh database matches the live site. Idempotent.
-- ============================================================

UPDATE profile
SET speech_lines = E'Full Stack Developer\nJava Spring Boot Engineer\nASP.NET Developer';

UPDATE experiences SET location = 'Mumbai, Maharashtra' WHERE company = 'SBFC Finance Ltd';

UPDATE projects
SET short_description = 'Multi-tenant SaaS for society management with Super Admin onboarding, dedicated dashboards for Society Admins and Residents, JWT authentication, maintenance billing and resident self-service portal',
    full_description  = 'Multi-tenant SaaS for society management with Super Admin onboarding, dedicated dashboards for Society Admins and Residents, JWT authentication, maintenance billing and resident self-service portal'
WHERE name LIKE 'eSociety%';

UPDATE projects
SET short_description = 'Multi-tenant hotel platform with 5 role-based dashboards, 50+ REST APIs, automated billing engine across 8 database tables, guest self-service portal with food ordering and 7 room service types',
    full_description  = 'Multi-tenant hotel platform with 5 role-based dashboards, 50+ REST APIs, automated billing engine across 8 database tables, guest self-service portal with food ordering and 7 room service types'
WHERE name LIKE 'UrbanInn%';

-- Skills: exact rows and order
DELETE FROM skills WHERE name IN ('.NET 8', 'Dapper', 'Hibernate');
UPDATE skills SET name = 'ASP.NET Core' WHERE name = 'ASP.NET Core Web API';
UPDATE skills SET category = 'DevOps'   WHERE category = 'DevOps & Deployment';
UPDATE skills SET category = 'Security' WHERE category = 'Authentication & Security';
INSERT INTO skills (name, category, display_order)
SELECT v.name, v.category, 0
FROM (VALUES ('CSS3', 'Frontend'), ('AWS', 'DevOps')) AS v(name, category)
WHERE NOT EXISTS (SELECT 1 FROM skills s WHERE s.name = v.name);

UPDATE skills s SET display_order = o.ord
FROM (VALUES
    ('Java', 1), ('Spring Boot', 2), ('C#', 3), ('ASP.NET Core', 4), ('REST APIs', 5), ('Apache Kafka', 6),
    ('React.js', 7), ('Redux', 8), ('TypeScript', 9), ('JavaScript', 10), ('HTML5', 11), ('CSS3', 12), ('Tailwind CSS', 13), ('Bootstrap', 14),
    ('PostgreSQL', 15), ('MySQL', 16), ('MongoDB', 17), ('Microsoft SQL Server', 18),
    ('Docker', 19), ('Git', 20), ('GitHub', 21), ('GitHub Actions', 22), ('Jenkins', 23), ('Linux', 24), ('AWS', 25),
    ('JWT', 26), ('Keycloak', 27), ('RBAC', 28)
) AS o(name, ord)
WHERE s.name = o.name;
