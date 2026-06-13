# GameFramework — Production Report

## Project Overview

Node.js/Express REST API backend for a game platform with user registration, OTP-based authentication, token management, player profiles, image uploads (Cloudinary), and a money/transaction system.

**Overall Completeness: ~45%**
**Production Readiness: NOT READY**

---

## What's Implemented

| Feature | File | Status |
|---|---|---|
| User Registration | `register.js` | Done (with bugs) |
| OTP Verification | `register.js`, `login.js` | Done |
| Login / Token Auth | `login.js`, `token.js` | Done (with bugs) |
| Password Reset | `resetpassword.js` | Done |
| Player Profile Update | `playerupdate.js` | Done (with logic bug) |
| Image Upload (Cloudinary) | `imageupload.js` | Done |
| Money / Transaction System | `money.js` | Done (with security issues) |
| Get All Users | `getAllUsers.js` | Done (no auth guard) |
| MongoDB via Mongoose | `app.js` | Done |
| File logging (Morgan) | `app.js` | Partial |

---

## Critical Bugs to Fix Immediately

These are code-level bugs that will cause incorrect behavior in production:

- **`playerupdate.js:105`** — `if(!authHeader && authHeader.startsWith("Bearer "))` uses `&&` instead of `||`. The condition is always false, meaning auth check never blocks unauthenticated requests.
- **`token.js:59`** — Returns HTTP `400` on success. Should be `200`.
- **`token.js:89`** — `newtemptoken` has no return statement — function silently returns `undefined`.
- **`app.js:13`** — `path.resolve(__dirname, "../.env")` resolves to the parent directory, not the project root.
- **`app.js:15,17`** — `dotenv.config()` called twice unnecessarily.

---

## What Needs to Be Done for Production

### 1. Security (Critical — Fix First)

- [ ] Replace SHA256 password hashing with `bcrypt` or `argon2` — SHA256 with no salt is trivially crackable
- [ ] Remove all credentials from `.env` and version control — MongoDB Atlas URI, Cloudinary keys, and Gmail password are currently committed to git
- [ ] Create `.env.example` with placeholder values; add `.env` to `.gitignore`
- [ ] Remove plaintext passwords stored in `MoneyRequests` collection (`money.js:30`, `money.js:67`)
- [ ] Stop returning OTP and `temptoken` in the register response (`register.js:78`) — send via email only
- [ ] Add auth guard to `getAllUsers` endpoint — currently returns all user records to anyone
- [ ] Exclude sensitive fields (`password`, `temptoken`, `permtoken`) from all API responses
- [ ] Add rate limiting (`express-rate-limit`) on login, OTP, and password reset endpoints to prevent brute-force
- [ ] Add `helmet.js` for security headers (CSP, X-Frame-Options, HSTS, etc.)
- [ ] Configure CORS policy — currently no CORS middleware, vulnerable to CSRF
- [ ] Add input validation and sanitization on all `req.body` fields (`express-validator` or `zod`)
- [ ] Validate `ObjectId` format before all database queries to prevent injection/crashes

### 2. Authentication & Tokens (Critical)

- [ ] Add TTL/expiry to `permtoken` — tokens currently never expire
- [ ] Store tokens as hashes in the database, not plaintext
- [ ] Implement proper JWT (`jsonwebtoken` is in `package.json` but unused) or signed tokens
- [ ] Add token revocation mechanism (logout, password change)
- [ ] Enforce OTP expiry server-side with a stricter mechanism than `updatedAt` timestamp check

### 3. Error Handling (Critical)

- [ ] Add global error handler middleware in `app.js`
- [ ] Standardize all API response shapes — currently mixing `ResponseCode`/`responsecode`, `ResponseData`/`responseData`, `message`/`ResponseMessage`
- [ ] Replace `process.exit(1)` on DB connection failure with graceful shutdown and retry logic
- [ ] Add file type and size validation on image uploads — currently unlimited memory storage
- [ ] Validate `parseInt()` on money amounts — negative values and non-numeric strings currently accepted

### 4. Code Quality (High)

- [ ] Fix logic bug in `playerupdate.js:105` (see Critical Bugs above)
- [ ] Fix HTTP status code in `token.js:59` (see Critical Bugs above)
- [ ] Fix missing return in `token.js:89` (see Critical Bugs above)
- [ ] Extract duplicated helper functions (`generateRandomAlphanumeric`, `encodeStringToBase64`, Bearer token extraction) into a shared `utils/` module — currently duplicated in 3+ files
- [ ] Normalize routing — currently mixing `app.post()` in `app.js` and `router.post()` in `Routes.js`
- [ ] Remove unused dependencies: `path` v0.12.7 (deprecated), `fs` v0.0.1-security, `jsonwebtoken` (imported but unused)
- [ ] Add type validation everywhere `parseInt()` / `parseFloat()` is used

### 5. Database (High)

- [ ] Add indexes on frequently queried fields: `email`, `permtoken`, `temptoken`
- [ ] Refactor `MoneyRequests` schema to reference `userId` (ObjectId) instead of storing user's name/email/password as strings
- [ ] Add Mongoose connection pool configuration
- [ ] Add schema-level validation (email format, minimum password length, non-negative amounts)
- [ ] Document database schema and add a migration strategy

### 6. Testing (High)

- [ ] Set up `Jest` or `Mocha` + `Supertest` test framework — currently zero tests
- [ ] Write unit tests for all controller functions
- [ ] Write integration tests for all API endpoints
- [ ] Add test for auth middleware bypass bug in `playerupdate.js`
- [ ] Target minimum 70% code coverage
- [ ] Set up CI (GitHub Actions) to run tests on every push

### 7. Logging & Monitoring (Medium)

- [ ] Replace all `console.log`/`console.error` with structured logger (`winston` or `pino`)
- [ ] Add log rotation to `access.log` — currently grows unbounded
- [ ] Add request/response ID tracking for distributed tracing
- [ ] Integrate error tracking (Sentry)
- [ ] Add a `/health` endpoint for uptime monitoring

### 8. Configuration Management (Medium)

- [ ] Add `NODE_ENV` support — currently no dev/staging/prod differentiation
- [ ] Make `PORT` configurable via environment variable (currently hardcoded `3001`)
- [ ] Add startup validation that all required ENV vars are present before the app starts
- [ ] Centralize config into `config/index.js`

### 9. Deployment & DevOps (Medium)

- [ ] Add `Dockerfile` and `.dockerignore`
- [ ] Add `docker-compose.yml` for local dev (app + MongoDB)
- [ ] Add graceful shutdown handler (`process.on('SIGTERM', ...)`)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add `pm2` or equivalent for process management in production
- [ ] Configure production-grade MongoDB (replica set or Atlas with proper IP whitelist)

### 10. Documentation (Medium)

- [ ] Add `README.md` with: project overview, local setup, env var reference, API summary
- [ ] Add OpenAPI/Swagger spec for all endpoints
- [ ] Document the authentication flow (register → OTP → login → token)
- [ ] Add `.env.example` file

---

## Priority Order

| Priority | Task | Effort |
|---|---|---|
| P0 — Blocker | Fix auth bypass bug in `playerupdate.js:105` | 30 min |
| P0 — Blocker | Fix HTTP 400 success response in `token.js:59` | 15 min |
| P0 — Blocker | Rotate all committed secrets, add `.env` to `.gitignore` | 1 day |
| P0 — Blocker | Switch to bcrypt, stop storing plaintext passwords in MoneyRequests | 1–2 days |
| P1 — Critical | Remove sensitive data from API responses, add auth to getAllUsers | 1 day |
| P1 — Critical | Input validation on all endpoints | 2–3 days |
| P1 — Critical | Add rate limiting, helmet, CORS | 1 day |
| P1 — Critical | Standardize response format | 1–2 days |
| P2 — Important | Test suite with CI | 1–2 weeks |
| P2 — Important | Structured logging + Sentry | 2–3 days |
| P2 — Important | Refactor duplicate utils, fix routing | 2–3 days |
| P2 — Important | DB indexes + schema validation | 1–2 days |
| P3 — Nice to have | Docker + deployment config | 2–3 days |
| P3 — Nice to have | JWT tokens with expiry | 2–3 days |
| P3 — Nice to have | README + Swagger docs | 2–3 days |

**Estimated total effort to production-ready: 6–8 weeks (solo developer)**
