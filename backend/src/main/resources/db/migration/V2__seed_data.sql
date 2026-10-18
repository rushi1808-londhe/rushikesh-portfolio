-- ============================================================
-- V2: Seed portfolio content
-- ============================================================

-- ---------- Profile ----------
INSERT INTO profile (name, title, tagline, location, phone, email, summary, speech_lines)
VALUES (
    'Rushikesh Londhe',
    'Full Stack Developer',
    'I build real things that actually matter',
    'Mumbai, Maharashtra, India',
    '+91 74989 36755',
    'rushikeshdl18@gmail.com',
    'Over the last 4 months at SBFC Finance Ltd, I’ve worked on real production systems in fintech — from employee onboarding and field agent workflows to fixing live bugs and building core modules of a new LOS system from scratch. I like understanding why a feature matters to the business before I build it, and I’m looking for a role where technical work is tied to real impact.',
    E'Hey! I’m Rushikesh, a Full Stack Developer from Mumbai.\nI build real things that actually matter.\nWelcome to my portfolio.'
);

-- ---------- Social Links ----------
INSERT INTO social_links (platform, url, icon, display_order) VALUES
    ('GitHub',   'https://github.com/rushi1808-londhe',        'github',   1),
    ('LinkedIn', 'https://linkedin.com/in/rushikesh-londhe',   'linkedin', 2);

-- ---------- Skills ----------
INSERT INTO skills (name, category, display_order) VALUES
    ('Java',                  'Backend', 1),
    ('Spring Boot',           'Backend', 2),
    ('C#',                    'Backend', 3),
    ('.NET 8',                'Backend', 4),
    ('ASP.NET Core Web API',  'Backend', 5),
    ('REST APIs',             'Backend', 6),
    ('Dapper',                'Backend', 7),
    ('Hibernate',             'Backend', 8),
    ('Apache Kafka',          'Backend', 9),

    ('React.js',      'Frontend', 10),
    ('Redux',         'Frontend', 11),
    ('TypeScript',    'Frontend', 12),
    ('JavaScript',    'Frontend', 13),
    ('HTML5',         'Frontend', 14),
    ('CSS3',          'Frontend', 15),
    ('Tailwind CSS',  'Frontend', 16),
    ('Bootstrap',     'Frontend', 17),

    ('PostgreSQL',            'Databases', 18),
    ('Microsoft SQL Server',  'Databases', 19),
    ('MySQL',                 'Databases', 20),
    ('MongoDB',               'Databases', 21),

    ('JWT',       'Authentication & Security', 22),
    ('Keycloak',  'Authentication & Security', 23),
    ('RBAC',      'Authentication & Security', 24),

    ('Docker',          'DevOps & Deployment', 25),
    ('Linux',           'DevOps & Deployment', 26),
    ('Git',             'DevOps & Deployment', 27),
    ('GitHub',          'DevOps & Deployment', 28),
    ('GitHub Actions',  'DevOps & Deployment', 29),
    ('Jenkins',         'DevOps & Deployment', 30);

-- ---------- Experience ----------
WITH exp AS (
    INSERT INTO experiences (company, role, duration, location, display_order)
    VALUES ('SBFC Finance Ltd', 'Full Stack Developer Apprentice', 'June 2026 – Present', 'Mumbai, Maharashtra, India', 1)
    RETURNING id
)
INSERT INTO experience_bullets (experience_id, content, display_order)
SELECT exp.id, b.content, b.ord
FROM exp,
     (VALUES
        ('Built 30+ APIs covering Auth, UAM, and onboarding flows for offrole employees across NAPS, NATS, and PMIS programs; integrated CRIF credit bureau and CrimeCheck with webhook callback handling', 1),
        ('Automated daily customer push to Leviosa/Lentra, resolving a daily failure affecting ~20% of new customers previously handled manually by the support team', 2),
        ('Contributed to final phases of a field agent platform and deployed to production on Windows Server; platform onboarded 100+ partners and facilitated 150+ leads within 10 days of go-live', 3),
        ('Identified and resolved a missing metadata bug in a document update flow, unblocking 30–40 impacted cases within 1 week through root cause analysis and CAB deployment', 4),
        ('Built a Kafka-based Notification Builder covering SMS, Email, and WhatsApp, eliminating all hardcoded notification logic; Dockerized all services (.NET 8, React, Kafka, Keycloak) and integrated 30+ third-party APIs with full documentation', 5)
     ) AS b(content, ord);

-- ---------- Projects ----------
WITH p AS (
    INSERT INTO projects (name, short_description, full_description, github_url, display_order)
    VALUES (
        'eSociety – Society Maintenance and Management',
        'Multi-tenant SaaS platform for society management with Super Admin onboarding and dedicated dashboards for Society Admins and Residents, secured using JWT authentication',
        'Multi-tenant SaaS platform for society management with Super Admin onboarding and dedicated dashboards for Society Admins and Residents, secured using JWT authentication',
        'https://github.com/rushi1808-londhe',
        1)
    RETURNING id
)
INSERT INTO project_bullets (project_id, content, display_order)
SELECT p.id, b.content, b.ord
FROM p,
     (VALUES
        ('Developed a multi-tenant SaaS platform with Super Admin onboarding and dedicated dashboards for Society Admins and Residents, secured using JWT authentication', 1),
        ('Implemented a maintenance billing system to manage due dates, track payments, and generate itemized receipts across society units', 2),
        ('Built a resident self-service portal featuring complaint management, status tracking, society announcements, and flat-wise payment history', 3)
     ) AS b(content, ord);

WITH p AS (
    INSERT INTO projects (name, short_description, full_description, github_url, display_order)
    VALUES (
        'UrbanInn – Multi-Tenant Hotel Management SaaS',
        'Multi-tenant hotel management platform with 5 role-based dashboards and 50+ REST API endpoints',
        'Multi-tenant hotel management platform with 5 role-based dashboards and 50+ REST API endpoints',
        'https://github.com/rushi1808-londhe',
        2)
    RETURNING id
)
INSERT INTO project_bullets (project_id, content, display_order)
SELECT p.id, b.content, b.ord
FROM p,
     (VALUES
        ('Developed a multi-tenant hotel management platform with five role-based dashboards and 50+ REST API endpoints secured using JWT authentication', 1),
        ('Engineered an automated billing system that consolidates room charges, food orders, and service requests into itemized bills across 8 database tables with print support', 2),
        ('Implemented a guest self-service portal with phone and room-based authentication, food ordering, and 7 room service types', 3)
     ) AS b(content, ord);
