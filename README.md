# Rushikesh Londhe — Portfolio

React + TypeScript + Tailwind + Framer Motion frontend (Nginx), Spring Boot 3 / Java 17 API, PostgreSQL with Flyway — fully dockerized.

## Run

```bash
docker compose up --build
```

| URL | What |
| --- | --- |
| http://localhost:3000 | Portfolio |
| http://localhost:3000/admin | Admin panel (credentials from `.env`: `ADMIN_USERNAME` / `ADMIN_PASSWORD`) |
| http://localhost:3000/swagger-ui.html | Swagger UI (disable with `SWAGGER_ENABLED=false`) |

On first start Flyway creates the schema (`V1__create_tables.sql`) and seeds all content (`V2__seed_data.sql`).
Postgres data lives in the `pgdata` volume, uploaded files in the `uploads` volume.

## Boot loader & hero

- **Boot loader** (`frontend/src/components/HackerLoader.tsx`): navy/cyan code rain + terminal boot sequence
  + progress bar for 3 s, then a glitch-out reveal. Plays on every page load (not on `/admin`).
  Portfolio data is prefetched while it plays.
- **Hero**: name, typewriter roles (Admin → Profile → *Hero typewriter roles*), tagline, CTAs, GitHub /
  LinkedIn / Gmail on the left; a VS Code–style editor on the right. Its text is configurable in
  Admin → Profile → *Hero code editor text* (empty = generated from your profile, skills and experience).

## Tech-stack keyboard

Each key shows the skill's logo and name; rows are skill categories, ordered by display order.
Logo resolution: the logo chosen in **Admin → Skills** (search the official Iconify logo sets, or upload an
image) → built-in logo matched by name → generic glyph. New skills with no logo and no built-in match get the
best official logo automatically on save. The chosen SVG is stored with the skill, so the public site never
calls Iconify. To extend the built-in set, edit `frontend/scripts/generate-skill-icons.cjs` and regenerate:

```bash
cd frontend
npm i --no-save @iconify/utils @iconify-json/logos @iconify-json/devicon @iconify-json/simple-icons @iconify-json/tabler
node scripts/generate-skill-icons.cjs src/sections/TechKeyboard/skillIcons.data.ts
```

The key click is `frontend/src/assets/sounds/key-click.wav`.

## Content

All text comes from the API. Edit it in `/admin`: profile (incl. hero speech-bubble lines and resume PDF),
experience, projects (tags, highlights), skills (category = keyboard row), certificates, extracurriculars,
social links, and contact-form messages. Saves refresh any open portfolio tab immediately.

Sections with no data (certificates/extracurriculars) and the *Download Resume* button stay hidden until you add content.

Projects are shown one below another, each with a browser-framed screenshot slideshow (click to open
full screen). In **Admin → Projects** you manage each project's screenshots (multi-upload, captions, order;
the first is the cover) and its tech chips (pick from your skills with their logos, or add custom tags).
The bundled screenshots in `backend/src/main/resources/seed-uploads/` are copied into the uploads volume on
startup, so a fresh deployment has them too.

Certificates and extracurriculars accept **images or PDFs**. Every upload is stored and shown as a **JPG**
(a PDF's first page is rendered). For certificates, the original PDF is also kept and linked as *View PDF*.

## API

Public `GET /api/v1/{portfolio,profile,experiences,projects,skills,certificates,extracurriculars,social-links}`,
`POST /api/v1/contact` (rate limited), `POST /api/v1/auth/login` → JWT.
Admin (Bearer JWT): `POST/PUT/DELETE` on each resource, `PUT /api/v1/profile`, `POST /api/v1/files/upload`,
`GET/PATCH/DELETE /api/v1/contact`. Uploaded files are served at `/uploads/{file}`.

## Security

See [SECURITY.md](SECURITY.md) for the full list of controls (HttpOnly cookie sessions, CSRF protection,
two-layer rate limiting, account lockout, CSP and security headers, upload hardening) and the production
checklist (`COOKIE_SECURE=true`, `SWAGGER_ENABLED=false`, HTTPS, strong secrets).

## Local development (optional)

```bash
# requires a local Postgres on :5432 (db/user from .env)
cd backend && mvn spring-boot:run   # needs the .env values exported
cd frontend && npm install && npm run dev   # http://localhost:5173 (proxies /api to :8080)
```
