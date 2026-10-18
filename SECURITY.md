# Security

Controls implemented for the portfolio and its admin panel, mapped to common VAPT / OWASP findings.

## Authentication & session management

| Area | Control |
| --- | --- |
| Token storage | The JWT is sent **only** as a cookie: `HttpOnly`, `SameSite=Strict`, `Path=/`, `Secure` when `COOKIE_SECURE=true`. It never appears in a response body or `localStorage`, so XSS can't steal it. |
| Token integrity | HS512 with a ≥ 64-char secret (startup fails otherwise). Issuer, audience, `nbf`, expiry validated with 30 s skew; unique `jti` per token. |
| Session lifetime | 2 hours (`JWT_EXPIRATION_MS`); the admin UI also signs out at expiry. |
| Logout | `POST /api/v1/auth/logout` revokes the token's `jti` server-side and clears the cookie. |
| Brute force | Account locks after `LOGIN_MAX_FAILED_ATTEMPTS` (5) failures for `LOGIN_LOCK_DURATION` (15 min). The lock is persisted on the admin row, so restarts don't reset it. |
| User enumeration | Same error for an unknown user and a wrong password. A BCrypt check runs even for unknown users (constant-ish timing), and unknown usernames get locked exactly like real ones. |
| Passwords | BCrypt cost 12. `ADMIN_PASSWORD` must be ≥ 12 chars. It's read from env and re-synced on start; there is no default credential in code. |
| Audit log | `AUDIT` logger records `LOGIN_SUCCESS / LOGIN_FAILED / LOGIN_BLOCKED / LOGOUT` with user and IP. Usernames are sanitised against log injection. The last login time and IP are stored on the admin row. |

## Rate limiting (two layers)

| Layer | Limit |
| --- | --- |
| Nginx | Login 5 req/min/IP (burst 5) · API 20 req/s/IP (burst 40) · static 60 req/s · 50 concurrent connections/IP |
| Spring (`RateLimitFilter`) | Login 10 per 15 min/IP · contact 5/h · uploads 30/h · admin writes 60/min · reads 300/min (all configurable in `.env`) |

Over-limit responses are `429` with `Retry-After`. Client IPs come from Tomcat's RemoteIpValve, which only trusts `X-Forwarded-For` from internal proxies. Nginx overwrites that header with the real peer address, so clients can't spoof their IP.

## CSRF

Cookie-authenticated state-changing requests (and login) must carry an `Origin` (or `Referer`) matching the site or a configured CORS origin; otherwise they get `403`. Combined with `SameSite=Strict`, cross-site requests can't act as the admin. Bearer-token API clients are unaffected.

## Input validation & injection

* Bean Validation on every DTO (lengths, required fields, email).
* **Stored URLs** (project, certificate, resume, avatar, social links) must be `http(s)://`, `mailto:` (socials only) or `/uploads/…`. `javascript:` and other schemes are rejected.
* **Skill logos** (Iconify SVG JSON) are validated server-side. Script, event handlers, `foreignObject`, external `href`/`url()`, `<image>`, `<style>`, animation elements and DOCTYPE/entities are all rejected, and the JSON is re-serialised to `{body,width,height}`.
* JPA/parameterised queries only (no SQL string building).
* React escapes all rendered text; the only raw-SVG rendering is validated logo data.
* Contact form honeypot field silently drops bot submissions.

## File uploads

* Allow-list: JPEG, PNG, WEBP, GIF, PDF. **SVG is blocked**, because SVG can carry script.
* Magic-byte check must match the declared type. Random UUID filenames; path traversal prevented.
* Certificate / extracurricular uploads (`/api/v1/files/upload-image`) are **re-encoded to JPEG** (PDFs: first
  page via PDFBox, rendered from temp files). That strips metadata (EXIF/GPS) and destroys polyglot payloads.
  Image dimensions are checked before decoding (decompression-bomb guard), the output is capped at 2400 px, and
  password-protected PDFs are rejected.
* Served with `Content-Security-Policy: default-src 'none'; …; sandbox` and `nosniff`, so a disguised file can't execute.
  PDFs are the exception to the sandbox, since it would stop the browser's PDF viewer; they're still `nosniff` and covered by the site CSP.
* Size limit 15 MB (Spring) / 16 MB (Nginx).

## HTTP security headers

Frontend (Nginx) — every response:
`Content-Security-Policy` (self-only scripts, no inline script, `frame-ancestors 'none'`, `object-src 'none'`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Strict-Transport-Security`.
`/admin` adds `X-Robots-Tag: noindex` and `Cache-Control: no-store`. Auth responses are `no-store`.

Backend (Spring Security): the same set, plus `default-src 'none'; sandbox` for all `/api/**` and `/uploads/**` responses, and `Cross-Origin-Resource-Policy: same-origin`.

## Information disclosure

* Errors are RFC 7807 problem details with generic messages. Stack traces, exception names and binding errors are never included; unexpected errors are logged server-side only.
* `server_tokens off`, `X-Powered-By` stripped, dotfiles and source maps return 404, no directory listing.
* Actuator exposes `health` only, without details.
* Swagger/OpenAPI can be turned off with `SWAGGER_ENABLED=false` (recommended in production).
* `robots.txt` disallows `/admin`, `/api/`, docs.

## Infrastructure

* Only the frontend (Nginx) is published. The backend and Postgres are reachable only on the internal Docker network.
* Containers run as non-root (backend), DB data and uploads live in named volumes.
* HTTP method allow-list at Nginx (`TRACE`, `CONNECT`… → 405). Request timeouts against slow-loris attacks.
* CORS: explicit origin list, no credentials, `/api/**` only.

## Production checklist

1. Serve over **HTTPS** (TLS-terminating proxy or load balancer in front of port 3000).
2. `.env`: `COOKIE_SECURE=true`, `SWAGGER_ENABLED=false`, strong unique `POSTGRES_PASSWORD`, `JWT_SECRET` (≥ 64 random chars), `ADMIN_PASSWORD` (≥ 12 chars).
3. Set `CORS_ALLOWED_ORIGINS` to your real domain.
4. Keep `.env` out of version control (already in `.gitignore`).
