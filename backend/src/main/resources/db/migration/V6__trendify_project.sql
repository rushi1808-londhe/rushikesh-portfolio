-- ============================================================
-- V6: TrendiFy project (https://github.com/rushi1808-londhe/TrendiFy).
-- Skipped if a TrendiFy project already exists (e.g. added via the admin panel).
-- ============================================================
WITH p AS (
    INSERT INTO projects (name, short_description, full_description, github_url, display_order)
    SELECT 'TrendiFy – Online Fashion Store',
           'Full-stack fashion e-commerce store with Super Admin, Admin and Customer roles, 43 REST APIs secured with JWT, cart and checkout with live stock validation, and sales analytics',
           'Full-stack fashion e-commerce store with Super Admin, Admin and Customer roles, 43 REST APIs secured with JWT, cart and checkout with live stock validation, and sales analytics',
           'https://github.com/rushi1808-londhe/TrendiFy',
           3
    WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name LIKE 'TrendiFy%')
    RETURNING id
), tags AS (
    INSERT INTO project_tags (project_id, name, display_order)
    SELECT p.id, t.name, t.ord
    FROM p, (VALUES ('React.js', 1), ('Spring Boot', 2), ('Java', 3), ('MySQL', 4), ('JWT', 5), ('Bootstrap', 6)) AS t(name, ord)
)
INSERT INTO project_bullets (project_id, content, display_order)
SELECT p.id, b.content, b.ord
FROM p,
     (VALUES
        ('Built a full-stack fashion e-commerce platform with React 18 and Spring Boot 3.2, exposing 43 REST API endpoints secured with JWT authentication across 3 roles: Super Admin, Admin and Customer', 1),
        ('Implemented cart and checkout with real-time stock validation and deduction, automatic shipping calculation, 3 payment methods and a 5-stage order lifecycle from Pending to Delivered', 2),
        ('Developed admin dashboards for product, image, inventory and order management, plus Super Admin analytics covering revenue, total orders and top-selling products', 3)
     ) AS b(content, ord);
