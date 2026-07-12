# Arkiora

An open-source, enterprise-grade ERP framework built with **FastAPI**, **Next.js**, and **PostgreSQL**. Arkiora provides a reusable foundation for developing scalable business applications with a modular architecture, JSON-RPC APIs, RBAC, workflow automation, and metadata-driven UI generation.

**AssetFlow** (Asset Management) is the first production module built on this framework.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [Why Module-Based Architecture](#why-module-based-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [Adding a New Module](#adding-a-new-module)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Framework

- **JSON-RPC 2.0 API** — Single endpoint (`POST /api/jsonrpc`) handles all model operations. Standard methods (`search`, `read`, `create`, `write`, `unlink`, `count`) are available on every registered model with zero boilerplate.
- **JWT Authentication (RS256)** — Access and refresh token pair with automatic rotation. Argon2id password hashing with configurable cost parameters.
- **Role-Based Access Control (RBAC)** — Three-layer permission system: model-level (can this role access this model?), field-level (which fields can this role read/write?), and record-level (which rows can this role see via domain filters).
- **Metadata-Driven UI** — The backend serves field and table metadata via API. The frontend never hardcodes forms or tables — `GenericForm` and `GenericTable` components render dynamically from metadata, so adding a field to a backend model updates the UI automatically.
- **Workflow Engine** — State machine per model with configurable states and transitions. Every transition is logged with user, timestamp, and optional notes.
- **Audit Trail** — Every create, update, and delete is recorded with old values, new values, user, IP address, and request ID.
- **Soft Delete** — No data is ever hard-deleted. Records are marked with `deleted_at` and excluded from queries automatically.
- **Background Jobs** — Persistent job queue backed by PostgreSQL and ARQ workers.
- **Notification Engine** — In-app notifications with WebSocket delivery.
- **Brute-Force Protection** — Sliding-window rate limiter on login and on the JSON-RPC endpoint.
- **CORS and Security Headers** — Configurable via environment variables.

### AssetFlow Module (Asset Management)

- Full lifecycle management for fixed assets: **draft → active → under maintenance → disposed**
- Asset categories with hierarchical structure
- Allocation requests with approval workflow: **requested → approved → allocated → returned**
- Transfer requests between departments
- Booking/reservation system for shared assets
- Maintenance request tracking
- Audit cycle management
- Depreciation entries
- Attachment support (S3-compatible storage)
- Comments and activity timeline per record
- Tagging system

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend language | Python 3.12+ |
| Backend framework | FastAPI 0.115+ |
| ORM | SQLAlchemy 2.0 (async) |
| Database | PostgreSQL 16 |
| Migrations | Alembic |
| Cache / Sessions | Redis 7 |
| Password hashing | Argon2id (argon2-cffi) |
| JWT | python-jose (RS256) |
| Frontend framework | Next.js 15 (App Router) |
| Frontend language | TypeScript 5 (strict mode) |
| UI library | React 19 |
| Styling | Tailwind CSS 3 |
| Server state | TanStack Query v5 |
| Forms | React Hook Form v7 + Zod v3 |
| Client state | Zustand v4 |
| Icons | lucide-react |
| Infrastructure | Docker, Kubernetes-ready |

---

## Project Structure

```
arkiora/
├── backend/
│   ├── core/                        # Framework internals — never modified for new modules
│   │   ├── auth/                    # Login, refresh, logout, /me endpoints
│   │   ├── audit/                   # Audit log writer
│   │   ├── crud/                    # Generic async repository + query builder
│   │   ├── jsonrpc/                 # JSON-RPC 2.0 dispatcher and router
│   │   ├── permissions/             # RBAC: model, field, and record-level
│   │   ├── registry/                # Model registry and method registry
│   │   ├── security/                # JWT (RS256) and Argon2id password hashing
│   │   ├── config.py                # Pydantic-settings — all config via env vars
│   │   ├── database.py              # Async SQLAlchemy engine and session
│   │   ├── exceptions.py            # Typed exception hierarchy
│   │   └── logging.py               # Structured logging setup
│   │
│   ├── modules/
│   │   └── asset_management/        # AssetFlow module (vertical slice)
│   │       ├── domain/              # Entities, value objects, domain events, repo interfaces
│   │       ├── application/         # Commands, queries, DTOs, services
│   │       ├── infrastructure/      # SQLAlchemy ORM models, repository implementations
│   │       └── presentation/        # API schemas, UI metadata
│   │
│   ├── infrastructure/
│   │   └── orm/
│   │       └── core_models.py       # Shared ORM models (User, Role, Company, AuditLog, etc.)
│   │
│   ├── shared/                      # Cross-cutting primitives
│   │   ├── base_entity.py           # Domain entity base class
│   │   ├── base_orm_model.py        # SQLAlchemy declarative base with id/created/updated/deleted
│   │   ├── events.py                # DomainEvent base class
│   │   └── types.py                 # Shared type aliases
│   │
│   ├── migrations/                  # Alembic migration versions
│   ├── scripts/                     # Seed data and E2E demo scripts
│   ├── tests/                       # Smoke tests
│   ├── main.py                      # App factory
│   ├── pyproject.toml               # Dependencies and tooling config
│   └── alembic.ini
│
└── frontend/
    ├── app/                         # Next.js App Router pages
    │   ├── (auth)/                  # Login and signup pages
    │   └── (dashboard)/             # Protected dashboard layout and module pages
    ├── src/
    │   ├── shared/
    │   │   ├── components/          # GenericTable, GenericForm, Sidebar, Topbar, etc.
    │   │   ├── services/            # jsonrpc.ts, auth.ts, upload.ts
    │   │   └── store/               # Zustand stores: auth, ui, notifications
    │   └── lib/
    │       ├── modules.ts           # Module registry — defines nav, routes, and metadata config
    │       └── utils.ts
    ├── next.config.ts
    ├── tailwind.config.ts
    └── package.json
```

---

## Database Design

### Schema Conventions

Every table in Arkiora follows a strict set of conventions that are enforced through `BaseORMModel`:

| Convention | Rule |
|---|---|
| Primary key | `UUID` generated by `gen_random_uuid()` — never `INT`/`SERIAL` |
| Timestamps | Every table has `created_at`, `updated_at`, `deleted_at` (all timezone-aware) |
| Tenant isolation | Every data table has a `company_id` foreign key |
| Authorship | Mutable tables have `created_by` and `updated_by` foreign keys to `users` |
| Soft delete | Records are never hard-deleted — `deleted_at` is set instead |
| Optimistic locking | Contested records carry a `version INT` column |
| High-volume tables | `audit_logs`, `background_jobs`, `activity_timeline` are range-partitioned by `created_at` |

### Why these conventions matter

**UUIDs as primary keys** prevent enumeration attacks (an attacker cannot guess `/api/assets/1`, `/api/assets/2`), make distributed ID generation safe, and allow records to be created offline and synced later.

**Soft delete** preserves audit history, allows undo operations, and prevents foreign key violations when a referenced record is "removed". The generic repository automatically filters `deleted_at IS NULL` on every query.

**Timezone-aware timestamps** (`TIMESTAMPTZ` in PostgreSQL) ensure correct behavior across servers in different regions and eliminate DST-related bugs.

**`company_id` on every table** enforces tenant isolation at the database layer. The permission service uses this to scope all queries so that one company can never access another company's data — even if there is an application-level bug.

### Core Tables

```
companies          → top-level tenant
users              → belong to a company
departments        → hierarchical, company-scoped
roles              → hierarchical, company-scoped
user_roles         → many-to-many user ↔ role
permissions        → (model, action) pairs
role_permissions   → many-to-many role ↔ permission
field_permissions  → per-role field read/write flags
record_rules       → row-level filter expressions (JSONB domain)
sessions           → refresh token store
audit_logs         → full change history (partitioned)
activity_timeline  → human-readable activity feed (partitioned)
notifications      → in-app notification inbox
attachments        → file metadata (binary in S3)
comments           → threaded, attached to any model record
tags / record_tags → tagging for any model record
workflow_definitions   → state machine config per model (JSONB)
workflow_transitions   → state change history
background_jobs    → persistent async job queue (partitioned)
settings           → company-scoped key-value config store
```

### AssetFlow Module Tables

```
assets             → core asset records with lifecycle status
asset_categories   → hierarchical category tree
asset_allocations  → assignment of assets to users/departments
transfer_requests  → inter-department transfer workflow
asset_bookings     → time-bound reservations
maintenance_requests → fault/maintenance ticket workflow
audit_cycles       → periodic physical verification
depreciation_entries → accounting depreciation schedule
```

---

## Why Module-Based Architecture

Arkiora uses **Clean Architecture + Domain-Driven Design (DDD) + Feature-Based Modular Architecture**. Each module is a vertical slice — it owns its domain logic, application services, database models, and API metadata independently.

### The Problem with Flat Structures

A flat structure (all models in one `models.py`, all routes in one `routes.py`) works at small scale but becomes unmanageable as a project grows:

- A change in one feature breaks unrelated features
- Business logic leaks into HTTP handlers and database queries
- It becomes impossible to test a feature in isolation
- Onboarding a new developer means understanding the entire codebase at once

### How the Module Structure Solves This

Each module under `modules/` follows four internal layers:

```
modules/asset_management/
├── domain/          ← Pure Python business logic. No FastAPI, no SQLAlchemy.
├── application/     ← Orchestrates domain objects. Defines what the system can do.
├── infrastructure/  ← Implements database access using SQLAlchemy.
└── presentation/    ← Defines API schemas and UI metadata.
```

**Domain layer** contains entities, value objects, and repository *interfaces*. It has zero external dependencies — it can be unit-tested without a database or web server.

**Application layer** contains services that implement use cases by calling domain objects and repository interfaces. It does not know whether data comes from PostgreSQL or an in-memory stub.

**Infrastructure layer** contains the concrete SQLAlchemy repository implementations that satisfy the domain interfaces. Swapping the database engine requires changing only this layer.

**Presentation layer** contains Pydantic schemas for request/response validation and the metadata that drives the frontend UI.

### The Core Rule

The `core/` framework never imports from any module. Modules never import each other's internals. All cross-module communication goes through domain events and the model/method registries. This means:

- Adding a new ERP module (Inventory, HRMS, Payroll) requires **zero changes to existing code**
- Each module can be developed, tested, and reasoned about independently
- The framework can be extracted and reused across different products

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- **Python** 3.12 or higher
- **Node.js** 18 or higher
- **PostgreSQL** 16
- **Redis** 7
- **uv** or **pip** for Python package management

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Linux / macOS
# .venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -e ".[dev]"

# 4. Copy and configure environment variables
cp .env.example .env
# Edit .env with your database URL, Redis URL, and other settings

# 5. Run database migrations
alembic upgrade head

# 6. Seed initial data (creates a default company and superadmin user)
python scripts/seed.py

# 7. Start the development server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive API docs: `http://localhost:8000/docs`

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Copy and configure environment variables
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_BASE=http://localhost:8000

# 4. Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `APP_DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/assetflow` | PostgreSQL connection string |
| `APP_REDIS_URL` | `redis://localhost:6379/0` | Redis connection string |
| `APP_JWT_PRIVATE_KEY` | *(auto-generated in dev)* | RS256 private key in PEM format. **Must be set in production.** |
| `APP_JWT_PUBLIC_KEY` | *(auto-generated in dev)* | RS256 public key in PEM format. **Must be set in production.** |
| `APP_ACCESS_TOKEN_TTL_MINUTES` | `15` | Access token lifetime in minutes |
| `APP_REFRESH_TOKEN_TTL_DAYS` | `7` | Refresh token lifetime in days |
| `APP_CORS_ORIGINS` | `["*"]` | Comma-separated list of allowed origins. Set explicitly in production. |
| `APP_DEBUG` | `false` | Enable debug mode |
| `APP_RATE_LIMIT_PER_MINUTE` | `100` | JSON-RPC requests allowed per minute per IP |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | `http://localhost:8000` | Backend API base URL |

---

## Available Scripts

### Backend

```bash
# Start development server with auto-reload
uvicorn main:app --reload

# Run database migrations
alembic upgrade head

# Create a new migration after model changes
alembic revision --autogenerate -m "describe your change"

# Seed the database with initial data
python scripts/seed.py

# Run smoke tests (no database required)
python -m pytest tests/smoke_test.py

# Run all tests
python -m pytest

# Lint
ruff check .

# Type check
mypy .
```

### Frontend

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## API Overview

All data operations go through a single JSON-RPC endpoint.

**Endpoint:** `POST /api/jsonrpc`  
**Authentication:** `Authorization: Bearer <access_token>`

### Request Format

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "call",
  "params": {
    "model": "asset",
    "method": "search",
    "args": [],
    "kwargs": {
      "domain": [["status", "=", "active"]],
      "fields": ["name", "serial_number", "status"],
      "limit": 20,
      "offset": 0
    }
  }
}
```

### Standard Methods

Every registered model supports these methods out of the box:

| Method | Description |
|---|---|
| `search` | Query records with domain filters, field selection, pagination, and sorting |
| `read` | Fetch one or more records by ID |
| `create` | Create a new record |
| `write` | Update one or more records |
| `unlink` | Soft-delete one or more records |
| `count` | Count records matching a domain filter |

### Authentication Endpoints (REST)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Exchange credentials for access + refresh tokens |
| `POST` | `/api/auth/refresh` | Rotate refresh token and get a new access token |
| `POST` | `/api/auth/logout` | Revoke the current session |
| `GET` | `/api/auth/me` | Get the current user's profile |

### Health Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health/live` | Liveness check |
| `GET` | `/health/ready` | Readiness check |

---

## Adding a New Module

The framework is designed so that adding a new ERP module requires zero changes to existing code.

1. Create the module directory with four sub-folders:
   ```
   modules/<module_name>/
   ├── domain/
   ├── application/
   ├── infrastructure/
   └── presentation/
   ```
2. Write domain entities and repository interfaces in `domain/`
3. Write application services and DTOs in `application/`
4. Write SQLAlchemy ORM models in `infrastructure/`
5. Create an Alembic migration: `alembic revision --autogenerate -m "add <module_name>"`
6. Write repository implementations in `infrastructure/`
7. Write UI metadata in `presentation/metadata.py`
8. Register models and methods in `modules/<module_name>/__init__.py`
9. Add one import line in `main.py` to call `register()` from the lifespan hook
10. Create the frontend module under `frontend/src/` following the same pattern as `asset_management`

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change. For significant changes, create a feature branch and submit a pull request.

Before submitting:
- Ensure `ruff check .` passes with no errors
- Ensure `mypy .` passes with no errors
- Ensure `npm run typecheck` passes with no errors
- Add tests for new functionality

---

## License

This project is licensed under the MIT License.
