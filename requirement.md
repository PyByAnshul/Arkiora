# ERP Framework — Requirements Specification

**Project:** AssetFlow ERP (ERP Framework, first module: Asset Management)
**Version:** 1.0.0
**Date:** 2026-07-12
**Author:** Architecture Team

---

## 1. Project Overview

Build a **reusable ERP Framework** where **AssetFlow (Asset Management)** is the first module. The framework must be extensible enough that future ERP modules — Inventory, CRM, HRMS, Payroll, Hospital, School, Manufacturing, Fleet, and Accounting — can be plugged in without modifying the core framework.

The system follows **Clean Architecture + Domain-Driven Design (DDD) + Feature-Based Modular Architecture**. MVC is explicitly prohibited.

---

## 2. Technology Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.13 | Runtime |
| FastAPI | latest | REST + JSON-RPC API framework |
| SQLAlchemy | 2.0 (Async) | ORM and DB abstraction |
| PostgreSQL | 16+ | Primary relational database |
| Alembic | latest | Database migrations |
| Redis | 7+ | Caching, sessions, pub/sub |
| JWT | RFC 7519 | Authentication tokens |
| JSON-RPC | 2.0 | Odoo-style method dispatch |
| WebSockets | native | Real-time notifications |
| Docker | latest | Containerization |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 | App Router, SSR/CSR |
| React | 19 | UI library |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 3+ | Utility-first CSS |
| shadcn/ui | latest | Component library |
| TanStack Query | 5 | Server state management |
| TanStack Table | 8 | Generic data table |
| React Hook Form | 7 | Form management |
| Zod | 3 | Schema validation |
| Zustand | 4 | Client state management |

---

## 3. Architecture

### 3.1 Layered Architecture (Mandatory — No MVC)
```
Presentation Layer   → API routes, JSON-RPC endpoints, WebSocket handlers
Application Layer    → Use cases, commands, queries, DTOs, orchestration
Domain Layer         → Entities, value objects, domain events, business rules
Infrastructure Layer → DB repositories, cache, external services, ORM models
```

Every layer communicates only with the layer directly below it via interfaces (dependency inversion). No layer may skip or bypass another.

### 3.2 Modular Architecture
- Each ERP module is a self-contained vertical slice.
- Modules communicate only through published interfaces and domain events.
- No circular dependencies allowed between modules.
- The framework (core) never imports from a module.

---

## 4. Functional Requirements

### 4.1 Core Framework Features

#### Authentication & Sessions
- FR-AUTH-01: User registration with email verification
- FR-AUTH-02: Login with email + password; returns JWT access token + refresh token
- FR-AUTH-03: Refresh token rotation (new refresh token on each use)
- FR-AUTH-04: Logout invalidates refresh token in Redis
- FR-AUTH-05: Brute-force protection — lockout after 5 failed attempts per IP/user
- FR-AUTH-06: Session tracking — multiple active sessions per user
- FR-AUTH-07: Force-logout all sessions for a user (admin action)
- FR-AUTH-08: Password reset via email OTP

#### Authorization
- FR-AUTHZ-01: Role-Based Access Control (RBAC) — users have one or more roles
- FR-AUTHZ-02: Roles carry a set of permissions (model + action)
- FR-AUTHZ-03: Field-level permissions — restrict read/write access per field per role
- FR-AUTHZ-04: Record Rules — dynamic domain filters applied per user/role (e.g., "user can only see own company's assets")
- FR-AUTHZ-05: Dynamic Permissions — permissions can be granted/revoked at runtime without restart
- FR-AUTHZ-06: Permission inheritance — child roles inherit parent role permissions
- FR-AUTHZ-07: Super-admin bypass — a flag to bypass all permission checks

#### JSON-RPC Dispatcher (Odoo-style)
- FR-RPC-01: Single endpoint `POST /api/jsonrpc` accepts `{ jsonrpc, id, method, params: { model, method, args, kwargs } }`
- FR-RPC-02: Dispatcher authenticates request via JWT
- FR-RPC-03: Dispatcher loads user, roles, and permissions from cache
- FR-RPC-04: Dispatcher checks model-level and method-level permissions
- FR-RPC-05: Dispatcher applies Record Rules as query filters
- FR-RPC-06: Dispatcher resolves model from Model Registry
- FR-RPC-07: Dispatcher resolves method from Method Registry
- FR-RPC-08: Dispatcher validates input parameters via registered schema
- FR-RPC-09: Dispatcher executes business logic and returns `{ jsonrpc, id, result }` or `{ jsonrpc, id, error }`
- FR-RPC-10: All RPC calls are audit-logged

#### Generic CRUD & Search
- FR-CRUD-01: Generic `create`, `read`, `update`, `delete`, `search`, `count` methods available on any registered model
- FR-CRUD-02: Generic pagination — `page`, `page_size`, `offset`
- FR-CRUD-03: Generic sorting — `sort_by`, `sort_order` (asc/desc)
- FR-CRUD-04: Generic filtering — field, operator, value (supports `=`, `!=`, `>`, `<`, `>=`, `<=`, `like`, `ilike`, `in`, `not in`, `is null`, `is not null`)
- FR-CRUD-05: Soft delete — records are never hard-deleted by default (`deleted_at`, `is_deleted` flag)
- FR-CRUD-06: Bulk create, bulk update, bulk delete operations
- FR-CRUD-07: Record versioning / optimistic locking via `version` column

#### Workflow Engine
- FR-WF-01: Define state machines per model (e.g., asset: draft → active → under_maintenance → disposed)
- FR-WF-02: Transitions have guards (conditions), actions (side-effects), and required permissions
- FR-WF-03: Trigger transitions via JSON-RPC method call
- FR-WF-04: Workflow history stored in `workflow_transitions` table
- FR-WF-05: Hook points: before_transition, after_transition, on_error

#### Notification Engine
- FR-NOTIF-01: In-app notifications via WebSocket push
- FR-NOTIF-02: Email notifications (async, via background worker)
- FR-NOTIF-03: Notification templates with variable substitution
- FR-NOTIF-04: Notification preferences per user (opt-in/opt-out per event type)
- FR-NOTIF-05: Notification read/unread tracking
- FR-NOTIF-06: Notification center UI shows all user notifications with pagination

#### Audit Engine
- FR-AUDIT-01: Every create/update/delete on any tracked model writes an audit log entry
- FR-AUDIT-02: Audit log stores: `model`, `record_id`, `action`, `old_values`, `new_values`, `user_id`, `timestamp`, `ip_address`
- FR-AUDIT-03: Activity Timeline — per-record chronological history visible in UI
- FR-AUDIT-04: Field-level change tracking
- FR-AUDIT-05: Audit logs are immutable (no update/delete allowed)
- FR-AUDIT-06: RPC calls are audit-logged separately

#### File Management
- FR-FILE-01: Upload attachments linked to any model record
- FR-FILE-02: Supported types: PDF, image (JPEG/PNG/WEBP), Excel, CSV, ZIP
- FR-FILE-03: File size limit configurable per model (default 20 MB)
- FR-FILE-04: Files stored on S3-compatible storage; metadata in DB
- FR-FILE-05: Signed URLs for secure file download
- FR-FILE-06: Virus scan hook (pluggable)
- FR-FILE-07: Soft delete for attachments

#### Comments & Tags
- FR-CMT-01: Polymorphic comments on any model record
- FR-CMT-02: Nested replies (one level)
- FR-CMT-03: Mention users in comments (`@username`)
- FR-TAG-01: Polymorphic tags on any model record
- FR-TAG-02: Tag autocomplete search

#### Dashboard Engine
- FR-DASH-01: Configurable dashboards per user/role
- FR-DASH-02: Widget types: KPI card, bar chart, pie chart, line chart, data table, calendar
- FR-DASH-03: Widget data fetched via JSON-RPC method
- FR-DASH-04: Drag-and-drop layout per user

#### Report Builder
- FR-RPT-01: Define reports via metadata (model, fields, filters, grouping, aggregation)
- FR-RPT-02: Export reports to PDF and Excel
- FR-RPT-03: Schedule reports for periodic email delivery

#### Scheduler & Background Jobs
- FR-SCH-01: Cron-style scheduler for recurring tasks
- FR-SCH-02: One-time background jobs (e.g., send email, process import)
- FR-SCH-03: Job status tracking: pending → running → completed / failed / retrying
- FR-SCH-04: Configurable retry with backoff
- FR-SCH-05: Dead-letter queue for permanently failed jobs

#### Import / Export
- FR-IE-01: Bulk import records from CSV/Excel per model
- FR-IE-02: Column mapping UI
- FR-IE-03: Validation with per-row error report
- FR-IE-04: Export any filtered record set to CSV/Excel
- FR-IE-05: Import/export jobs run as background tasks

#### Multi-Company & Multi-Tenant
- FR-MC-01: A user can belong to one or more companies
- FR-MC-02: All data-bearing tables carry `company_id`
- FR-MC-03: Record Rules enforce company-level data isolation
- FR-MC-04: Multi-tenant support is architected at the schema level (future activation)

#### Settings
- FR-SET-01: System-level settings (key-value store, typed)
- FR-SET-02: Company-level settings override system settings
- FR-SET-03: User-level preferences

---

### 4.2 AssetFlow Module (Asset Management)

#### Assets
- FR-AM-01: Create assets with: name, code, category, company, department, purchase date, purchase price, current value, location, serial number, description, status, image
- FR-AM-02: Asset statuses: Draft → Active → Under Maintenance → Disposed / Written Off
- FR-AM-03: Asset categories (hierarchical) with depreciation method config
- FR-AM-04: Auto-generate asset code (prefix + sequence)
- FR-AM-05: Attach documents to assets (invoice, warranty, manual)
- FR-AM-06: Asset search by name, code, category, department, status, location
- FR-AM-07: QR code generation per asset

#### Asset Allocation
- FR-AL-01: Allocate an asset to a user or department
- FR-AL-02: Allocation request flow: requested → approved → allocated → returned
- FR-AL-03: Allocation history per asset
- FR-AL-04: One asset can be allocated to only one entity at a time
- FR-AL-05: Notification on allocation change

#### Transfer Requests
- FR-TR-01: Request transfer of asset between departments or locations
- FR-TR-02: Transfer approval workflow (configurable approvers)
- FR-TR-03: Transfer history logged on asset timeline

#### Bookings / Reservations
- FR-BK-01: Book a shared asset for a time slot
- FR-BK-02: Conflict detection — overlapping bookings rejected
- FR-BK-03: Booking calendar view
- FR-BK-04: Booking approval (optional per asset category)

#### Maintenance
- FR-MNT-01: Log maintenance requests for an asset
- FR-MNT-02: Maintenance types: preventive (scheduled), corrective (on-demand)
- FR-MNT-03: Maintenance statuses: open → in_progress → resolved → closed
- FR-MNT-04: Assign technician, set scheduled date, log resolution notes
- FR-MNT-05: Maintenance cost tracking
- FR-MNT-06: Recurring maintenance scheduling (via Scheduler)

#### Audit Cycle
- FR-AUD-01: Create audit cycles (period, assigned auditor, scope)
- FR-AUD-02: Auditor scans/searches assets and records findings: verified / missing / damaged
- FR-AUD-03: Audit results linked to assets
- FR-AUD-04: Discrepancy report generation
- FR-AUD-05: Audit cycle statuses: planned → in_progress → completed

#### Depreciation
- FR-DEP-01: Support depreciation methods: Straight Line, Written Down Value, Units of Production
- FR-DEP-02: Calculate and record monthly/annual depreciation
- FR-DEP-03: Depreciation schedule preview on asset creation
- FR-DEP-04: Book value updated on each depreciation run

#### Reports
- FR-RPT-AM-01: Asset Register report (list all active assets with current value)
- FR-RPT-AM-02: Asset Allocation report
- FR-RPT-AM-03: Depreciation report
- FR-RPT-AM-04: Maintenance cost report
- FR-RPT-AM-05: Audit discrepancy report
- FR-RPT-AM-06: Asset movement history

---

## 5. Non-Functional Requirements

### 5.1 Performance
- NFR-PERF-01: API response time < 200 ms for 95th percentile under normal load (1,000 concurrent users)
- NFR-PERF-02: JSON-RPC dispatch overhead < 10 ms (excluding business logic)
- NFR-PERF-03: Database queries must use indexes; no sequential scans on large tables
- NFR-PERF-04: Redis cache hit rate > 80% for permission/role lookups
- NFR-PERF-05: File uploads handled via async streaming; no blocking I/O
- NFR-PERF-06: WebSocket connections must scale horizontally via Redis pub/sub

### 5.2 Scalability
- NFR-SCALE-01: Backend is horizontally scalable (stateless; sessions in Redis)
- NFR-SCALE-02: PostgreSQL read replicas for heavy read workloads
- NFR-SCALE-03: Async SQLAlchemy — no blocking DB calls on the event loop
- NFR-SCALE-04: Background workers (Celery/ARQ) scale independently
- NFR-SCALE-05: Table partitioning on `audit_logs`, `background_jobs`, `activity_timeline` by date
- NFR-SCALE-06: Kubernetes-ready — each service has health check, readiness probe, liveness probe

### 5.3 Security
- NFR-SEC-01: Passwords hashed with Argon2id (bcrypt as fallback)
- NFR-SEC-02: JWT signed with RS256 (asymmetric keys); access token TTL = 15 min, refresh token TTL = 7 days
- NFR-SEC-03: HTTPS enforced; HSTS header set
- NFR-SEC-04: CORS restricted to allowed origins
- NFR-SEC-05: CSRF protection on state-changing requests (Double Submit Cookie or SameSite)
- NFR-SEC-06: Rate limiting: 100 requests/minute per IP globally; 10 login attempts/minute per IP
- NFR-SEC-07: SQL injection prevention via parameterized queries (SQLAlchemy ORM only)
- NFR-SEC-08: Input sanitization on all user-supplied strings
- NFR-SEC-09: Sensitive fields (passwords, tokens) never logged or returned in responses
- NFR-SEC-10: All secrets managed via environment variables / secret manager; never hardcoded
- NFR-SEC-11: Field-level encryption for PII columns (configurable)
- NFR-SEC-12: OWASP Top 10 mitigations applied

### 5.4 Reliability & Availability
- NFR-REL-01: Target uptime 99.9% (excluding planned maintenance)
- NFR-REL-02: Database connection pool with retry on transient failures
- NFR-REL-03: Background jobs have at-least-once delivery with idempotency keys
- NFR-REL-04: Graceful shutdown — in-flight requests completed before process exit
- NFR-REL-05: Health check endpoints: `/health/live` and `/health/ready`

### 5.5 Maintainability
- NFR-MAINT-01: Code coverage ≥ 80% on domain and application layers
- NFR-MAINT-02: All public interfaces documented with docstrings
- NFR-MAINT-03: Linting via Ruff; type checking via mypy (strict mode)
- NFR-MAINT-04: Frontend: ESLint + Prettier; no `any` types allowed
- NFR-MAINT-05: Alembic migrations for every DB schema change; never modify existing migrations
- NFR-MAINT-06: Environment-based configuration; no hardcoded config values

### 5.6 Observability
- NFR-OBS-01: Structured JSON logging (stdout) with correlation IDs on every request
- NFR-OBS-02: OpenTelemetry traces for all API requests, DB queries, and cache calls
- NFR-OBS-03: Prometheus metrics endpoint `/metrics`
- NFR-OBS-04: Dashboard in Grafana (or equivalent) for system health
- NFR-OBS-05: Error tracking via Sentry (or equivalent)

### 5.7 API Design
- NFR-API-01: REST endpoints versioned at `/api/v1/...`
- NFR-API-02: JSON-RPC endpoint at `/api/jsonrpc`
- NFR-API-03: OpenAPI / Swagger docs auto-generated at `/docs`
- NFR-API-04: All responses follow a consistent envelope: `{ success, data, error, meta }`
- NFR-API-05: Pagination metadata in response: `{ total, page, page_size, total_pages }`

---

## 6. Constraints

- C-01: No MVC pattern anywhere in the codebase
- C-02: No circular dependencies between modules or layers
- C-03: No direct DB access from Presentation or Application layers (only through Repository interfaces)
- C-04: Modules must not import from each other's internal implementation; only from published interfaces
- C-05: All async — no synchronous DB or HTTP calls inside FastAPI route handlers
- C-06: Frontend must never hardcode forms — all forms are metadata-driven

---

## 7. Future Modules (Planned, Not in Scope Now)

Inventory · CRM · HRMS · Payroll · Hospital Management · School Management · Manufacturing · Fleet Management · Accounting

Each future module must be addable by:
1. Creating a new module directory under `modules/`
2. Registering models in the Model Registry
3. Registering methods in the Method Registry
4. Running Alembic migration
5. No changes to core framework code required
