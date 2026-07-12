# ERP Framework — Design Document

**Project:** AssetFlow ERP (ERP Framework, first module: Asset Management)
**Version:** 1.0.0
**Date:** 2026-07-12

---

## 1. Architecture Overview

The system follows **Clean Architecture + Domain-Driven Design (DDD) + Feature-Based Modular Architecture**.

```
┌──────────────────────────────────────────┐
│         Presentation Layer               │
│  FastAPI routes, JSON-RPC endpoint,      │
│  WebSocket handlers, request/response    │
│  serialization, OpenAPI schemas          │
└────────────────┬─────────────────────────┘
                 │ calls via interfaces
┌────────────────▼─────────────────────────┐
│         Application Layer                │
│  Use cases, commands, queries, DTOs,     │
│  application services, orchestration,    │
│  event publishing                        │
└────────────────┬─────────────────────────┘
                 │ calls via interfaces
┌────────────────▼─────────────────────────┐
│           Domain Layer                   │
│  Entities, value objects, aggregates,    │
│  domain events, business rules,          │
│  domain services, repository interfaces  │
└────────────────┬─────────────────────────┘
                 │ implemented by
┌────────────────▼─────────────────────────┐
│        Infrastructure Layer              │
│  SQLAlchemy ORM models, repository       │
│  implementations, Redis cache, S3,       │
│  email, background workers, migrations   │
└──────────────────────────────────────────┘
```

**Rules:**
- Each layer only depends on the layer directly below it.
- Domain layer has zero external dependencies.
- No layer may import from a higher layer.
- Modules communicate only via published interfaces and domain events — never by importing each other's internals.

---

## 2. Backend Folder Structure

```
backend/
├── core/                          # Framework core — never imports from modules
│   ├── config.py                  # Settings via pydantic-settings
│   ├── database.py                # Async SQLAlchemy engine + session factory
│   ├── redis.py                   # Redis client factory
│   ├── dependencies.py            # FastAPI DI providers (get_db, get_current_user…)
│   ├── exceptions.py              # Base exception hierarchy
│   ├── logging.py                 # Structured JSON logger
│   ├── middleware/
│   │   ├── cors.py
│   │   ├── rate_limit.py
│   │   ├── request_id.py          # Injects X-Request-ID correlation header
│   │   └── audit.py               # Logs every mutating request
│   ├── security/
│   │   ├── jwt.py                 # Token creation, verification, refresh rotation
│   │   ├── password.py            # Argon2id hashing
│   │   └── csrf.py
│   ├── registry/
│   │   ├── model_registry.py      # Central map: model_name → domain class
│   │   └── method_registry.py     # Central map: (model, method) → callable
│   ├── jsonrpc/
│   │   ├── dispatcher.py          # JSON-RPC 2.0 request lifecycle
│   │   ├── router.py              # FastAPI route: POST /api/jsonrpc
│   │   └── schemas.py             # JsonRpcRequest / JsonRpcResponse pydantic models
│   ├── crud/
│   │   ├── base_repository.py     # Generic async repository (create/read/update/delete/search)
│   │   └── query_builder.py       # Translates generic filter/sort/page params to SQLAlchemy
│   ├── workflow/
│   │   ├── engine.py              # State machine executor
│   │   ├── registry.py            # Workflow definitions per model
│   │   └── models.py              # ORM: workflow_definitions, workflow_transitions
│   ├── notifications/
│   │   ├── service.py             # Dispatch in-app + email notifications
│   │   ├── websocket_manager.py   # WebSocket connection pool (Redis pub/sub backed)
│   │   └── models.py              # ORM: notifications, notification_preferences
│   ├── audit/
│   │   ├── service.py             # Write audit log entries
│   │   └── models.py              # ORM: audit_logs, activity_timeline
│   ├── files/
│   │   ├── service.py             # Upload, download signed URL, soft delete
│   │   ├── storage.py             # S3-compatible adapter interface
│   │   └── models.py              # ORM: attachments
│   ├── scheduler/
│   │   ├── service.py             # Register + trigger cron/one-time jobs
│   │   └── models.py              # ORM: scheduled_jobs, background_jobs
│   └── permissions/
│       ├── service.py             # Check model/method/field permissions
│       ├── record_rules.py        # Apply dynamic domain filters per user
│       └── models.py              # ORM: roles, permissions, record_rules, user_roles
│
├── modules/                       # ERP modules — each is fully self-contained
│   └── asset_management/          # AssetFlow module
│       ├── __init__.py            # Module manifest: registers models + methods
│       ├── domain/
│       │   ├── entities/
│       │   │   ├── asset.py
│       │   │   ├── asset_category.py
│       │   │   ├── allocation.py
│       │   │   ├── transfer_request.py
│       │   │   ├── booking.py
│       │   │   ├── maintenance.py
│       │   │   ├── audit_cycle.py
│       │   │   └── depreciation.py
│       │   ├── value_objects/
│       │   │   ├── asset_code.py
│       │   │   └── money.py
│       │   ├── events/
│       │   │   ├── asset_created.py
│       │   │   ├── asset_allocated.py
│       │   │   └── maintenance_requested.py
│       │   └── repositories/      # Interfaces only (abstract base classes)
│       │       ├── i_asset_repository.py
│       │       └── i_allocation_repository.py
│       ├── application/
│       │   ├── commands/
│       │   │   ├── create_asset.py
│       │   │   ├── allocate_asset.py
│       │   │   ├── transfer_asset.py
│       │   │   └── request_maintenance.py
│       │   ├── queries/
│       │   │   ├── get_asset.py
│       │   │   ├── list_assets.py
│       │   │   └── asset_history.py
│       │   ├── dtos/
│       │   │   ├── asset_dto.py
│       │   │   └── allocation_dto.py
│       │   └── services/
│       │       ├── asset_service.py
│       │       ├── depreciation_service.py
│       │       └── audit_service.py
│       ├── infrastructure/
│       │   ├── orm/
│       │   │   ├── asset_model.py       # SQLAlchemy ORM table definitions
│       │   │   └── allocation_model.py
│       │   └── repositories/
│       │       ├── asset_repository.py  # Implements IAssetRepository
│       │       └── allocation_repository.py
│       └── presentation/
│           ├── routes.py                # REST endpoints (optional, alongside JSON-RPC)
│           ├── schemas.py               # Pydantic request/response schemas
│           └── metadata.py             # UI metadata (form fields, table columns)
│
├── shared/                        # Shared kernel — pure utilities, no domain logic
│   ├── base_entity.py             # BaseEntity with id, created_at, updated_at, is_deleted
│   ├── base_orm_model.py          # SQLAlchemy declarative base
│   ├── value_objects.py           # Common value objects (Email, PhoneNumber…)
│   ├── events.py                  # DomainEvent base class
│   └── types.py                   # Custom types (UUID, Money, etc.)
│
├── migrations/                    # Alembic migrations
│   ├── env.py
│   └── versions/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── main.py                        # FastAPI app factory + router registration
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
└── alembic.ini
```

---

## 3. Frontend Folder Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Shell: Sidebar + Topbar
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   └── [module]/
│   │   │       └── [...slug]/page.tsx # Dynamic module routing
│   │   ├── api/                      # Next.js route handlers (BFF layer)
│   │   └── layout.tsx
│   │
│   ├── modules/                      # Feature modules (mirrors backend)
│   │   ├── asset-management/
│   │   │   ├── components/           # Module-specific UI components
│   │   │   ├── hooks/                # useAssets, useAllocation, etc.
│   │   │   ├── services/             # API call functions (JSON-RPC wrappers)
│   │   │   ├── validation/           # Zod schemas
│   │   │   ├── types/                # TypeScript interfaces
│   │   │   ├── pages/                # Page-level components
│   │   │   └── routes.ts             # Route definitions for this module
│   │   └── [future-module]/
│   │
│   ├── shared/                       # Shared across all modules
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui re-exports + extensions
│   │   │   ├── GenericTable/         # TanStack Table wrapper (metadata-driven)
│   │   │   ├── GenericForm/          # React Hook Form + Zod (metadata-driven)
│   │   │   ├── GenericFilters/       # Dynamic filter builder
│   │   │   ├── GenericDialog/        # Modal wrapper
│   │   │   ├── GenericSearch/        # Debounced search bar
│   │   │   ├── GenericCalendar/      # Booking/scheduling calendar
│   │   │   ├── Sidebar/              # Permission-filtered nav
│   │   │   ├── Topbar/               # User menu, notifications bell
│   │   │   ├── NotificationCenter/   # WebSocket-fed notification list
│   │   │   ├── ActivityTimeline/     # Per-record audit trail
│   │   │   └── FileUpload/           # Drag-drop attachment uploader
│   │   ├── hooks/
│   │   │   ├── useJsonRpc.ts         # Base JSON-RPC caller (TanStack Query)
│   │   │   ├── usePermissions.ts     # Check current user's permissions
│   │   │   ├── useWebSocket.ts       # WebSocket connection management
│   │   │   └── useMetadata.ts        # Fetch form/table metadata from backend
│   │   ├── services/
│   │   │   ├── jsonrpc.ts            # JSON-RPC 2.0 client
│   │   │   ├── auth.ts               # Login, refresh, logout
│   │   │   └── upload.ts             # File upload service
│   │   ├── store/                    # Zustand stores
│   │   │   ├── auth.store.ts
│   │   │   ├── ui.store.ts
│   │   │   └── notification.store.ts
│   │   └── types/
│   │       ├── jsonrpc.ts
│   │       ├── permissions.ts
│   │       └── metadata.ts           # Form/table metadata type definitions
│   │
│   └── lib/
│       ├── utils.ts
│       ├── constants.ts
│       └── theme.ts
│
├── public/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Database Schema

### 4.1 Core Framework Tables

```sql
-- Companies & Tenants
CREATE TABLE companies (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    code        VARCHAR(50) UNIQUE NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    settings    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

-- Users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID REFERENCES companies(id),
    email           VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    is_active       BOOLEAN DEFAULT TRUE,
    is_superadmin   BOOLEAN DEFAULT FALSE,
    avatar_url      TEXT,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company ON users(company_id);

-- Departments
CREATE TABLE departments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID NOT NULL REFERENCES companies(id),
    parent_id   UUID REFERENCES departments(id),
    name        VARCHAR(255) NOT NULL,
    code        VARCHAR(50),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    UNIQUE(company_id, code)
);

-- Roles
CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID REFERENCES companies(id),  -- NULL = global role
    parent_id   UUID REFERENCES roles(id),
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(100) NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, code)
);

-- User ↔ Role mapping
CREATE TABLE user_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    company_id  UUID REFERENCES companies(id),
    granted_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role_id, company_id)
);

-- Permissions
CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model       VARCHAR(100) NOT NULL,   -- e.g. "asset"
    action      VARCHAR(50) NOT NULL,    -- create|read|update|delete|execute
    label       VARCHAR(255),
    UNIQUE(model, action)
);

-- Role ↔ Permission mapping
CREATE TABLE role_permissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);

-- Field-level permissions
CREATE TABLE field_permissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    model           VARCHAR(100) NOT NULL,
    field_name      VARCHAR(100) NOT NULL,
    can_read        BOOLEAN DEFAULT TRUE,
    can_write       BOOLEAN DEFAULT FALSE,
    UNIQUE(role_id, model, field_name)
);

-- Record Rules (dynamic row-level filters)
CREATE TABLE record_rules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id     UUID REFERENCES roles(id),
    model       VARCHAR(100) NOT NULL,
    domain      JSONB NOT NULL,          -- e.g. [["company_id","=","{{user.company_id}}"]]
    perm_type   VARCHAR(20) NOT NULL,    -- read|write|create|delete
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token   VARCHAR(512) UNIQUE NOT NULL,
    user_agent      TEXT,
    ip_address      INET,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    revoked_at      TIMESTAMPTZ
);
CREATE INDEX idx_sessions_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- Notifications
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(100) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    data        JSONB DEFAULT '{}',
    is_read     BOOLEAN DEFAULT FALSE,
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- Audit Logs (partitioned by month)
CREATE TABLE audit_logs (
    id              UUID DEFAULT gen_random_uuid(),
    company_id      UUID REFERENCES companies(id),
    user_id         UUID REFERENCES users(id),
    model           VARCHAR(100) NOT NULL,
    record_id       UUID NOT NULL,
    action          VARCHAR(20) NOT NULL,  -- create|update|delete
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    request_id      VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE audit_logs_2026_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
-- (additional partitions created via scheduler)

CREATE INDEX idx_audit_model_record ON audit_logs(model, record_id);

-- Activity Timeline
CREATE TABLE activity_timeline (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID REFERENCES companies(id),
    model       VARCHAR(100) NOT NULL,
    record_id   UUID NOT NULL,
    user_id     UUID REFERENCES users(id),
    verb        VARCHAR(100) NOT NULL,  -- "created", "allocated to John", etc.
    data        JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);
CREATE INDEX idx_timeline_record ON activity_timeline(model, record_id);

-- Attachments
CREATE TABLE attachments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID REFERENCES companies(id),
    model       VARCHAR(100) NOT NULL,
    record_id   UUID NOT NULL,
    filename    VARCHAR(500) NOT NULL,
    mime_type   VARCHAR(100),
    size_bytes  BIGINT,
    storage_key TEXT NOT NULL,          -- S3 object key
    uploaded_by UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);
CREATE INDEX idx_attachments_record ON attachments(model, record_id);

-- Comments
CREATE TABLE comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID REFERENCES companies(id),
    model       VARCHAR(100) NOT NULL,
    record_id   UUID NOT NULL,
    parent_id   UUID REFERENCES comments(id),
    user_id     UUID NOT NULL REFERENCES users(id),
    body        TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

-- Tags
CREATE TABLE tags (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID REFERENCES companies(id),
    name        VARCHAR(100) NOT NULL,
    color       VARCHAR(20),
    UNIQUE(company_id, name)
);
CREATE TABLE record_tags (
    tag_id      UUID NOT NULL REFERENCES tags(id),
    model       VARCHAR(100) NOT NULL,
    record_id   UUID NOT NULL,
    PRIMARY KEY (tag_id, model, record_id)
);

-- Workflow Definitions
CREATE TABLE workflow_definitions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model       VARCHAR(100) UNIQUE NOT NULL,
    states      JSONB NOT NULL,      -- ["draft","active","disposed"]
    transitions JSONB NOT NULL,      -- [{from, to, guard, action, permissions}]
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Transition History
CREATE TABLE workflow_transitions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model       VARCHAR(100) NOT NULL,
    record_id   UUID NOT NULL,
    from_state  VARCHAR(100),
    to_state    VARCHAR(100) NOT NULL,
    user_id     UUID REFERENCES users(id),
    notes       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_wf_transitions_record ON workflow_transitions(model, record_id);

-- Background Jobs
CREATE TABLE background_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type        VARCHAR(100) NOT NULL,
    status          VARCHAR(20) DEFAULT 'pending',  -- pending|running|completed|failed|retrying
    payload         JSONB NOT NULL,
    result          JSONB,
    error           TEXT,
    attempts        INT DEFAULT 0,
    max_attempts    INT DEFAULT 3,
    scheduled_at    TIMESTAMPTZ DEFAULT NOW(),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- System Settings
CREATE TABLE settings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID REFERENCES companies(id),  -- NULL = system-level
    key         VARCHAR(200) NOT NULL,
    value       JSONB NOT NULL,
    UNIQUE(company_id, key)
);
```

### 4.2 AssetFlow Module Tables

```sql
-- Asset Categories (hierarchical)
CREATE TABLE asset_categories (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id          UUID NOT NULL REFERENCES companies(id),
    parent_id           UUID REFERENCES asset_categories(id),
    name                VARCHAR(255) NOT NULL,
    code                VARCHAR(50),
    depreciation_method VARCHAR(50),   -- straight_line|written_down_value|units_of_production
    useful_life_years   INT,
    salvage_value       NUMERIC(15,2),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    UNIQUE(company_id, code)
);

-- Assets
CREATE TABLE assets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id          UUID NOT NULL REFERENCES companies(id),
    department_id       UUID REFERENCES departments(id),
    category_id         UUID NOT NULL REFERENCES asset_categories(id),
    code                VARCHAR(100) NOT NULL,
    name                VARCHAR(255) NOT NULL,
    serial_number       VARCHAR(255),
    description         TEXT,
    location            VARCHAR(255),
    status              VARCHAR(50) NOT NULL DEFAULT 'draft',
    purchase_date       DATE,
    purchase_price      NUMERIC(15,2),
    current_value       NUMERIC(15,2),
    salvage_value       NUMERIC(15,2),
    useful_life_years   INT,
    depreciation_method VARCHAR(50),
    qr_code_url         TEXT,
    version             INT DEFAULT 1,
    created_by          UUID REFERENCES users(id),
    updated_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    UNIQUE(company_id, code)
);
CREATE INDEX idx_assets_company_status ON assets(company_id, status);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_department ON assets(department_id);

-- Asset Allocations
CREATE TABLE asset_allocations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    asset_id        UUID NOT NULL REFERENCES assets(id),
    allocated_to    UUID REFERENCES users(id),
    department_id   UUID REFERENCES departments(id),
    status          VARCHAR(50) DEFAULT 'requested',   -- requested|approved|allocated|returned
    requested_at    TIMESTAMPTZ DEFAULT NOW(),
    approved_at     TIMESTAMPTZ,
    allocated_at    TIMESTAMPTZ,
    returned_at     TIMESTAMPTZ,
    notes           TEXT,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_allocations_asset ON asset_allocations(asset_id, status);

-- Transfer Requests
CREATE TABLE transfer_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    asset_id        UUID NOT NULL REFERENCES assets(id),
    from_dept_id    UUID REFERENCES departments(id),
    to_dept_id      UUID NOT NULL REFERENCES departments(id),
    status          VARCHAR(50) DEFAULT 'pending',  -- pending|approved|rejected|completed
    requested_by    UUID NOT NULL REFERENCES users(id),
    approved_by     UUID REFERENCES users(id),
    reason          TEXT,
    requested_at    TIMESTAMPTZ DEFAULT NOW(),
    approved_at     TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE asset_bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    asset_id        UUID NOT NULL REFERENCES assets(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    status          VARCHAR(50) DEFAULT 'pending',  -- pending|approved|rejected|cancelled
    purpose         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT no_overlap EXCLUDE USING gist (
        asset_id WITH =,
        tstzrange(start_time, end_time) WITH &&
    ) WHERE (status NOT IN ('rejected','cancelled'))
);

-- Maintenance Requests
CREATE TABLE maintenance_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    asset_id        UUID NOT NULL REFERENCES assets(id),
    type            VARCHAR(50) NOT NULL,   -- preventive|corrective
    status          VARCHAR(50) DEFAULT 'open',  -- open|in_progress|resolved|closed
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    assigned_to     UUID REFERENCES users(id),
    scheduled_date  DATE,
    resolved_at     TIMESTAMPTZ,
    resolution_notes TEXT,
    cost            NUMERIC(15,2),
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_maintenance_asset ON maintenance_requests(asset_id, status);

-- Audit Cycles
CREATE TABLE audit_cycles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID NOT NULL REFERENCES companies(id),
    name        VARCHAR(255) NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    auditor_id  UUID NOT NULL REFERENCES users(id),
    status      VARCHAR(50) DEFAULT 'planned',  -- planned|in_progress|completed
    scope       JSONB,   -- filters: departments, categories
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Results
CREATE TABLE audit_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_cycle_id  UUID NOT NULL REFERENCES audit_cycles(id),
    asset_id        UUID NOT NULL REFERENCES assets(id),
    finding         VARCHAR(50) NOT NULL,   -- verified|missing|damaged
    notes           TEXT,
    audited_by      UUID NOT NULL REFERENCES users(id),
    audited_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Depreciation Schedules
CREATE TABLE depreciation_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID NOT NULL REFERENCES assets(id),
    period_date     DATE NOT NULL,
    opening_value   NUMERIC(15,2) NOT NULL,
    depreciation    NUMERIC(15,2) NOT NULL,
    closing_value   NUMERIC(15,2) NOT NULL,
    method          VARCHAR(50) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(asset_id, period_date)
);
```

### 4.3 ER Diagram (Simplified)

```
companies ──< users ──< user_roles >── roles ──< role_permissions >── permissions
    │              │                     │
    │              │                     └── record_rules
    │              └── sessions
    │
    ├── departments
    │
    └── [AssetFlow]
        asset_categories ──< assets ──< asset_allocations
                                  │──< transfer_requests
                                  │──< asset_bookings
                                  │──< maintenance_requests
                                  │──< audit_results >── audit_cycles
                                  └──< depreciation_entries

[Polymorphic / cross-module]
assets ──< attachments (model="asset")
assets ──< comments   (model="asset")
assets ──< record_tags (model="asset")
assets ──< audit_logs  (model="asset")
assets ──< activity_timeline (model="asset")
```

---

## 5. JSON-RPC 2.0 Request Lifecycle

### 5.1 Request Format
```json
POST /api/jsonrpc
{
  "jsonrpc": "2.0",
  "id": "req-001",
  "method": "call",
  "params": {
    "model": "asset",
    "method": "create",
    "args": [],
    "kwargs": {
      "name": "Laptop Dell XPS",
      "category_id": "uuid-here",
      "purchase_price": 85000
    }
  }
}
```

### 5.2 Sequence Diagram
```
Client
  │
  ├─► POST /api/jsonrpc
  │
  │   [Middleware stack]
  ├─► RequestIDMiddleware     → inject X-Request-ID
  ├─► RateLimitMiddleware     → check Redis counter for IP
  ├─► CORSMiddleware
  │
  │   [JSON-RPC Dispatcher]
  ├─► Parse JsonRpcRequest    → validate jsonrpc/id/method/params structure
  ├─► JWTMiddleware           → decode Bearer token, reject if expired/invalid
  ├─► Load User               → fetch from Redis cache (or DB on miss)
  ├─► Load Roles+Permissions  → fetch from Redis cache (TTL 5 min)
  ├─► Check Model Permission  → does user's role allow action on model "asset"?
  ├─► Apply Record Rules      → inject WHERE clauses into query context
  ├─► Resolve Model           → ModelRegistry.get("asset") → AssetService
  ├─► Resolve Method          → MethodRegistry.get("asset","create") → callable
  ├─► Validate Params         → run registered Zod/Pydantic schema
  ├─► Execute Business Logic  → asset_service.create(kwargs, context)
  │     ├─► Domain validation (entity rules)
  │     ├─► Repository.save()
  │     ├─► Publish DomainEvent(AssetCreated)
  │     └─► Return AssetDTO
  ├─► Write AuditLog          → async, non-blocking
  ├─► Publish Activity        → async, non-blocking
  │
  └─► Return JsonRpcResponse
        { "jsonrpc":"2.0", "id":"req-001", "result": { ... } }

[On any error]
  └─► Return JsonRpcError
        { "jsonrpc":"2.0", "id":"req-001", "error": { "code":-32600, "message":"..." } }
```

### 5.3 JSON-RPC Error Codes
| Code | Meaning |
|------|---------|
| -32700 | Parse error |
| -32600 | Invalid request |
| -32601 | Method not found |
| -32602 | Invalid params |
| -32603 | Internal error |
| -32001 | Unauthorized |
| -32002 | Forbidden (permission denied) |
| -32003 | Record not found |
| -32004 | Validation error |
| -32005 | Workflow transition error |

---

## 6. Model Registry & Method Registry

### Model Registry
```python
# core/registry/model_registry.py
class ModelRegistry:
    _registry: dict[str, type] = {}

    @classmethod
    def register(cls, model_name: str, service_class: type) -> None:
        cls._registry[model_name] = service_class

    @classmethod
    def get(cls, model_name: str) -> type:
        if model_name not in cls._registry:
            raise ModelNotFoundError(model_name)
        return cls._registry[model_name]

# Registration happens in each module's __init__.py:
# modules/asset_management/__init__.py
ModelRegistry.register("asset", AssetService)
ModelRegistry.register("asset.category", AssetCategoryService)
ModelRegistry.register("asset.allocation", AllocationService)
```

### Method Registry
```python
# core/registry/method_registry.py
class MethodRegistry:
    _registry: dict[tuple[str,str], MethodDescriptor] = {}

    @classmethod
    def register(cls, model: str, method: str, handler: Callable,
                 schema: type | None = None, permissions: list[str] = []) -> None:
        cls._registry[(model, method)] = MethodDescriptor(handler, schema, permissions)

    @classmethod
    def get(cls, model: str, method: str) -> MethodDescriptor:
        key = (model, method)
        if key not in cls._registry:
            raise MethodNotFoundError(model, method)
        return cls._registry[key]

# Generic CRUD methods are auto-registered for every model via base service.
# Modules register custom methods:
MethodRegistry.register("asset", "allocate", asset_service.allocate,
                         schema=AllocateAssetSchema, permissions=["asset.allocate"])
```

---

## 7. Workflow Engine

```
Asset State Machine:
  draft ──► active ──► under_maintenance ──► active
    │          │                               │
    │          └──────────────────────────►  disposed
    └─────────────────────────────────────►  written_off

Transition guards (examples):
  draft → active:            asset.purchase_price is not null
  active → under_maintenance: user has permission "asset.request_maintenance"
  active → disposed:         user has role "asset_manager"
```

Workflow definition stored as JSON in `workflow_definitions` table. Engine loads it on startup and caches in Redis. On transition trigger:

1. Load current state from asset record
2. Find matching transition in definition
3. Evaluate guard condition
4. Check transition permission
5. Execute pre-transition hooks (e.g., notify approver)
6. Update record status in DB (within same transaction)
7. Write to `workflow_transitions` history
8. Execute post-transition hooks (e.g., send notification, update availability)
9. Publish domain event

---

## 8. Metadata-Driven UI

The backend returns form and table metadata so the frontend never hardcodes fields.

### Form Metadata (example: Asset form)
```json
{
  "model": "asset",
  "fields": [
    { "name": "name",           "label": "Asset Name",    "type": "text",     "required": true },
    { "name": "code",           "label": "Asset Code",    "type": "text",     "readonly": true },
    { "name": "category_id",    "label": "Category",      "type": "many2one", "model": "asset.category", "required": true },
    { "name": "purchase_price", "label": "Purchase Price","type": "currency", "required": true },
    { "name": "status",         "label": "Status",        "type": "select",   "options": ["draft","active","disposed"] },
    { "name": "purchase_date",  "label": "Purchase Date", "type": "date" }
  ],
  "actions": [
    { "name": "allocate",  "label": "Allocate",  "permission": "asset.allocate" },
    { "name": "dispose",   "label": "Dispose",   "permission": "asset.dispose"  }
  ]
}
```

Frontend `GenericForm` reads this metadata, builds the form dynamically using React Hook Form + Zod, and renders appropriate shadcn/ui input components. Field-level permissions hide or disable fields the user cannot access.

### Table Metadata
```json
{
  "model": "asset",
  "columns": [
    { "field": "code",      "header": "Code",     "sortable": true },
    { "field": "name",      "header": "Name",     "sortable": true },
    { "field": "status",    "header": "Status",   "filterable": true },
    { "field": "category",  "header": "Category", "filterable": true },
    { "field": "current_value", "header": "Value","sortable": true, "type": "currency" }
  ],
  "row_actions": ["view", "edit", "delete"],
  "bulk_actions": ["export", "delete"]
}
```

---

## 9. Caching Strategy

| Data | Store | TTL | Invalidation |
|------|-------|-----|--------------|
| User profile | Redis | 5 min | On user update |
| Roles + Permissions | Redis | 5 min | On role/permission change |
| Record Rules | Redis | 5 min | On rule change |
| UI Metadata | Redis | 30 min | On metadata change (admin) |
| Settings | Redis | 10 min | On settings save |
| Session tokens | Redis | 7 days | On logout / rotation |
| Search results | Redis | 1 min | On record mutation |
| Rate limit counters | Redis | 1 min sliding window | Auto-expire |

All cache keys include `company_id` and `user_id` where applicable to prevent cross-tenant leakage.

---

## 10. Scalability Architecture

```
                        ┌──────────────┐
                        │  DNS / LB    │  (Nginx / AWS ALB)
                        └──────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │ FastAPI  │    │ FastAPI  │    │ FastAPI  │  (stateless, N replicas)
        │ Pod 1    │    │ Pod 2    │    │ Pod N    │
        └────┬─────┘    └────┬─────┘    └────┬─────┘
             └───────────────┼───────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │ Redis    │       │ PG       │       │ PG Read  │
    │ Cluster  │       │ Primary  │       │ Replica  │
    │ (cache + │       │ (writes) │       │ (reads)  │
    │  pub/sub)│       └──────────┘       └──────────┘
    └──────────┘

    Background Workers (separate pods):
    ┌────────────┐  ┌────────────┐
    │  Celery /  │  │  Celery /  │
    │  ARQ Worker│  │  ARQ Worker│
    └────────────┘  └────────────┘
```

- **Writes** go to PostgreSQL primary.
- **Reads** go to read replicas (configured via SQLAlchemy engine routing).
- **WebSocket** connections use Redis pub/sub so any pod can push to any connected client.
- **Background workers** are separate pods that consume from the job queue.
- **Kubernetes HPA** scales FastAPI pods based on CPU/request latency metrics.
