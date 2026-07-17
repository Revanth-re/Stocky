# Kirana AI — Inventory & Demand Forecasting SaaS

Enterprise-grade inventory management and AI-powered demand forecasting for small retail (Kirana) stores. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Drizzle ORM, and MySQL.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Route Handlers, Server Components) |
| UI | React 19, Tailwind CSS 4, shadcn/ui, Motion, Lucide React |
| Data fetching | TanStack Query, TanStack Table |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Theming | next-themes (light/dark) |
| Toasts | react-hot-toast |
| Database | MySQL 8+ via Drizzle ORM / Drizzle Kit |
| Auth | JWT (access + refresh cookies) + bcrypt |

## Getting started

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL and JWT secrets
npm run db:push           # push schema to MySQL (or db:generate + db:migrate)
npm run db:seed           # seed global brands & categories
npm run dev
```

## Folder structure

```
app/          Next.js App Router routes: (auth), (onboarding), (dashboard) route groups + api/
components/   Design-system primitives (components/ui) + shared shell (sidebar, topbar, nav)
features/     Feature-sliced modules (auth, inventory, sales, forecast, reports, settings…)
              Each feature owns its own components/, api/ (TanStack Query hooks)
hooks/        Cross-cutting hooks (debounce, media query)
lib/          Framework-agnostic utilities (auth/jwt, rbac, nav config, cn, formatters)
db/           Drizzle schema (db/schema/*.ts), client, seed scripts
drizzle/      Generated SQL migrations (drizzle-kit output)
schemas/      Reserved for shared cross-feature Zod schemas
validators/   Zod input validators per domain (auth, product, sale, purchase-order, forecast…)
services/     Server-only business logic / DB queries, called from Route Handlers
types/        Shared TypeScript DTOs
utils/        Reserved for pure utility functions without framework deps
middleware.ts Edge auth guard (protects all non-public routes)
```

## Architecture notes

- **Auth**: JWT access token (15m) + refresh token (30d) in httpOnly cookies. `middleware.ts` guards routes at the edge; `lib/auth/session.ts` reads the session in Server Components. Roles: `owner` / `manager` / `employee`, with a permission matrix in `lib/auth/rbac.ts`.
- **Onboarding**: 5-step wizard (`features/onboarding`) that provisions the store, seeds a product catalog from `lib/catalog/global-catalog.ts`, and only asks the owner for purchase price / stock / supplier — everything else (SKU, category, suggested price) is pre-filled.
- **AI Forecast**: `GET/POST /api/forecast` are contract-stable placeholder endpoints (`services/forecast-service.ts`). Today they run a naive 14-day sales-velocity heuristic — **not real ML**. Swap the body of `runPlaceholderForecast` for a call to the Python service below and the UI needs zero changes.

## Future AI service integration

This app is intentionally architected so a separate Python service can be dropped in later without frontend changes:

```
Next.js  ──HTTP──▶  FastAPI (Prophet, XGBoost, OpenAI)
                     │
                     ├─ Redis (caching / job queue)
                     └─ MySQL (reads the same `products`, `sales`, `inventory` tables)
```

- `AI_SERVICE_URL` / `AI_SERVICE_API_KEY` are already in `.env.example`.
- `next.config.ts` proxies `/ai-service/*` to the Python service in local dev.
- The `forecasts` table's `model_meta` JSON column is reserved for whatever the real model wants to return (feature importances, seasonality flags, festival adjustments, etc.) without a schema migration.
- Planned services: demand forecasting, seasonal/festival-aware forecasting, dead-stock detection, automatic reorder suggestions, profit optimization, and an AI chat assistant (OpenAI).

## Database

16 tables in `db/schema/`: `users`, `stores`, `suppliers`, `brands`, `categories`, `products`, `inventory`, `sales`, `sale_items`, `purchase_orders`, `purchase_order_items`, `forecasts`, `notifications`, `activity_logs`, `settings` — all with `created_at`/`updated_at`, indexes on foreign keys, and soft-delete (`deleted_at`) on entities that need historical retention (users, stores, suppliers, products).

## Known placeholders (by design, per spec)

- **AI Forecasting**: naive heuristic, not Prophet/XGBoost — see above.
- **PDF export** (invoices, purchase orders, reports): uses the browser's native print-to-PDF (`window.print()` with print stylesheets) rather than a server PDF library, to keep the dependency surface small.
- **Excel export**: CSV served with an `.xls` MIME type/extension (opens natively in Excel). Swap for a real `.xlsx` writer (e.g. `exceljs`) if styled workbooks are needed.
- **Barcode scanner / OCR invoice reader / Excel import**: UI entry points exist (disabled buttons in the product library picker) with the integration point documented inline — no scanning/OCR library wired up yet.
