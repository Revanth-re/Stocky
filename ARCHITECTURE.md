# Architecture: Business-Template Engine (Phase 1)

This documents the first phase of turning this codebase from a single-vertical
("Kirana AI" grocery app) into a config-driven, multi-vertical SaaS platform
per the enterprise-SaaS spec. It covers what the codebase looked like before,
what changed, why, and what's deliberately left for later phases.

## 1. Starting point (analysis)

Before this change, the app was a solid, well-organized **Next.js 16 App
Router** monolith, feature-sliced (`features/<domain>/{api,components,hooks}`),
with Drizzle/MySQL, JWT auth, and RBAC — but built for exactly one business
type. The signal was everywhere:

- `stores.storeType` was a 5-value enum (`grocery`, `super_market`, `bakery`,
  `pharmacy`, `general_store`) captured at onboarding and then **never read
  again** except to decorate an AI prompt string. It didn't drive the
  sidebar, the dashboard, the product form, or anything else.
- The sidebar (`lib/nav-config.ts`) was a hardcoded array. Every tenant saw
  the same 9 links regardless of `storeType`, and the array didn't even
  filter by RBAC permission despite `NavItem` having a `permission` field.
- The product schema and form were grocery-shaped (`unit`/`weight` pricing,
  expiry date, barcode) with no extension point for IMEI, size/color, batch
  numbers, part numbers, etc.
- Onboarding's catalog step (`lib/catalog/global-catalog.ts`) only seeds
  grocery brands (Amul, Nestlé, Tata, ...) — there was no path for a
  pharmacy or electronics tenant to onboard sensibly.

Multi-tenancy itself was already solid: every domain table carries
`storeId` and every query is scoped by it (`db.query.x.findFirst({ where:
eq(x.storeId, session.storeId) })` throughout `services/`). That part of
the target architecture didn't need rework — it needed a business-template
layer built on top of it.

## 2. What Phase 1 builds: the `business/` config engine

New directory, `business/`, one file per template plus shared plumbing:

```
business/
├── types.ts          BusinessTemplateConfig shape + resolver helpers
├── registry.ts        BUSINESS_TEMPLATE_REGISTRY: BusinessTemplate -> config
├── core-modules.ts     CORE_MODULES — always-on nav, every tenant
├── ai-registry.ts      GLOBAL_AI_FEATURES — always-on AI, every tenant
├── grocery/config.ts
├── pharmacy/config.ts
├── fashion/config.ts
├── electronics/config.ts
├── hardware/config.ts
├── food/config.ts
├── automobile/config.ts
├── furniture/config.ts
├── cosmetics/config.ts
├── books/config.ts
├── agriculture/config.ts
└── custom/config.ts
```

Each `BusinessTemplateConfig` declares, as **data, not code**:

- `sidebarModules` — extra nav items beyond the 9 core modules
- `dashboardWidgets` — widget metadata (id/label/description/default-on)
- `productFields` — extra product attributes (key/type/label/options)
- `aiFeatures` — vertical AI capabilities, layered on top of global AI
- `reports` — report catalog entries

Nothing outside `business/` branches on `if (businessTemplate === "x")`.
Every consumer (sidebar, product form, settings) reads the active tenant's
resolved config from `business/registry.ts#getBusinessTemplate`. Adding a
13th vertical is: add the id to `businessTemplateEnum`
(`db/schema/stores.ts`), write `business/<id>/config.ts`, register it in
`business/registry.ts`. Nothing else needs to change — that's the
"never hardcode business logic" requirement from the spec, made concrete.

### Schema changes

- `stores.storeType` (5-value enum) → `stores.businessTemplate` (12-value
  enum: the PRD's 12 templates + `custom`). A deprecated `storeTypeEnum` /
  `StoreType` alias is kept in `db/schema/stores.ts` so nothing silently
  breaks if it's still referenced, but every real usage was migrated.
- `stores.enabledModules`, `stores.enabledAiFeatures` (nullable JSON string
  arrays) — a tenant's override of which optional modules/AI features are
  on. `null` means "use the active template's defaults"
  (`business/types.ts#resolveEnabledModuleIds`). This is what makes
  `custom` work: it ships zero defaults, and everything gets turned on
  through Settings > Modules.
- `stores.templateSettings` (JSON) — reserved for future per-tenant
  overrides of a template's config (e.g. a `custom` tenant defining their
  own `productFields`). Not consumed yet — see §5.
- `products.customFields` (JSON) — where a template's `productFields`
  values are stored. No migration needed for a new vertical's product
  attributes; only a new descriptor in that template's config.

A generated migration capturing this diff is at
`drizzle/0000_business_template_engine.sql`. This project's normal dev
workflow is `npm run db:push` (schema-first, no migration files) per the
README, so this migration exists as a readable record of the diff, not as
a required step — `db:push` will pick up the schema changes directly.

### Dynamic sidebar

`lib/nav-config.ts` changed from two static arrays to two functions:

- `getSidebarNav({ businessTemplate, role, enabledModules })` — merges
  `CORE_MODULES` with the active template's `sidebarModules`, filters by
  RBAC permission (previously **not enforced at all** despite the field
  existing) and by the tenant's `enabledModules` override.
- `getMobileNav({ role })` — the same core-module data, projected onto the
  fixed 5-slot mobile bottom nav.

`components/shared/sidebar.tsx` and `mobile-bottom-nav.tsx` now take
`businessTemplate`/`role`/`enabledModules` as props (passed down from
`app/(dashboard)/layout.tsx`, which already fetched the `store` row) and
render whatever the engine returns — no template-specific code in either
component. Modules flagged `comingSoon` in a config (most non-grocery
extras today — see §4) render disabled with a "Soon" badge instead of
linking to a 404.

### Dynamic product fields

`components/shared/dynamic-product-fields.tsx` takes a template's
`productFields` descriptors and renders the right input per `type` (text /
number / date / boolean / select), bound to `customFields.<key>` on the
product form via React Hook Form. `features/inventory/components/
product-form.tsx` reads the active tenant's template (via the existing
`useStoreProfile()` hook) and renders this section automatically — a
pharmacy tenant sees Batch Number / Manufacturer / Schedule Class; an
electronics tenant sees IMEI / Serial / Warranty; grocery sees nothing
extra (its fields — barcode, weight-based pricing, expiry — are already
core columns).

### Settings > Modules

New page (`app/(dashboard)/settings/modules`, `features/settings/
components/modules-settings-form.tsx`) lists the active template's optional
modules and every AI feature (global + template) as toggles, backed by
`GET/PATCH /api/settings/modules` → `services/settings-service.ts#
getModulesSettingsView` / `updateEnabledModules`. This is the primary
surface for the `custom` template and for any tenant who wants to turn
specific extras on/off.

### Onboarding

Step 2 (`features/onboarding/components/step-business-template.tsx`,
replacing the old 5-option `step-store-type.tsx`) is generated entirely
from `listBusinessTemplates()` — 12 cards with icon, description, and
feature tags, sourced from the registry.

Only `grocery` has a seeded product catalog today
(`lib/catalog/global-catalog.ts`), so the wizard branches: picking
`grocery` continues into the existing brand-select → catalog-preview →
stock-entry flow; picking anything else completes onboarding immediately
with an empty catalog (the tenant adds products manually from Inventory,
which already fully supports manual product entry). This is an honest MVP
boundary, not a shortcut disguised as a feature — see §4.

## 3. Files touched, by reason

| Reason | Files |
|---|---|
| Schema rename + new columns | `db/schema/stores.ts`, `db/schema/products.ts` |
| New engine | `business/**` (new) |
| Sidebar/nav | `lib/nav-config.ts`, `components/shared/sidebar.tsx`, `components/shared/mobile-bottom-nav.tsx`, `app/(dashboard)/layout.tsx`, `lib/i18n/translations.ts` (2 new keys) |
| Onboarding | `features/onboarding/components/{onboarding-wizard,onboarding-stepper,step-business-template}.tsx`, `validators/onboarding.ts`, `services/onboarding-service.ts` |
| Settings/Modules | `services/settings-service.ts`, `validators/settings.ts`, `app/api/settings/modules/route.ts` (new), `features/settings/api/use-modules.ts` (new), `features/settings/components/{modules-settings-form,settings-nav,store-settings-form}.tsx`, `app/(dashboard)/settings/modules/page.tsx` (new) |
| storeType→businessTemplate cleanup | `services/ai-forecast-service.ts` |
| Dynamic product fields | `components/shared/dynamic-product-fields.tsx` (new), `validators/product.ts`, `services/product-service.ts`, `types/product.ts`, `features/inventory/components/{product-form,product-form-dialog,product-library-picker}.tsx` |

`features/onboarding/components/step-store-type.tsx` couldn't be deleted
(sandbox restriction on this run) — it's now a one-line deprecated
re-export of `step-business-template.tsx`, safe to delete.

## 4. Known gaps — intentionally out of scope for Phase 1

This phase built the **engine**, not twelve fully-realized verticals. Be
honest with tenants about what's real:

- **Only grocery has real, working UI for its extras.** The other 11
  templates' `sidebarModules` are marked `comingSoon: true` and render
  disabled — e.g. pharmacy's "Prescription Sales", food's "Kitchen Orders"
  / "Tables", fashion's "Size & Color Matrix". The *data model* for these
  (product fields, AI feature descriptions, reports) is real; the
  *dedicated screens* are not built yet.
- **Only grocery has a seeded product catalog.** Every other template
  onboards into an empty product list.
- **Dashboard widgets are metadata only.** `dashboardWidgets` on each
  config describes what a template's dashboard *should* show, but
  `app/(dashboard)/dashboard/page.tsx` still renders the same fixed grocery
  widget set for every tenant. Wiring the dashboard grid to read
  `dashboardWidgets` dynamically is the natural next step (§5).
- **`custom` template is functionally the emptiest state**, not a
  fully generic field/module builder — a tenant can toggle core modules'
  visibility and pick from the global AI feature list, but can't yet define
  their *own* custom product fields through the UI (`stores.templateSettings`
  is reserved for this but unused).
- **Two pre-existing bugs surfaced, not fixed** (out of scope — didn't
  want to bundle unrelated fixes into this change): the product edit
  dialog prefills from the list row (`ProductListRow`), not the full
  `ProductDetail`, so editing silently drops `description`, `packSize`,
  `taxPercent`, `maxStock`, and the brand/category/supplier selections back
  to blank. Worth its own fix.
- **i18n**: business-template-contributed nav labels aren't translated
  (no `labelKey`) — they render in English regardless of language setting.
  Core module labels still translate correctly.
- **Expenses** is declared as a core module (per spec) but has no route/UI
  yet — marked `comingSoon` in `business/core-modules.ts` so it doesn't
  appear in the sidebar as a dead link.

## 5. Suggested Phase 2/3 roadmap

1. **Dynamic dashboard**: make `app/(dashboard)/dashboard/page.tsx` render
   from the active template's `dashboardWidgets` (+ tenant overrides),
   the same way the sidebar is now dynamic. Requires a small widget
   component registry (`widgetId -> component`) alongside `business/`.
2. **Build out one non-grocery vertical end-to-end** (pharmacy is the
   best next candidate — batch/expiry tracking and inventory-batches
   already exist in the schema) to prove the engine generalizes past
   grocery, then repeat for food (menu/kitchen/tables — the most
   structurally different one) and fashion (variant matrix).
3. **`custom` template field builder**: a settings UI that writes
   `ProductFieldDescriptor[]` into `stores.templateSettings
   .customProductFields`, read by the same `DynamicProductFields`
   component that already consumes a template's static `productFields`.
4. **Expenses module**: schema + service + UI — the one core module in
   the spec with no implementation at all today.
5. **Fix the product-edit prefill gap** (§4) — switch
   `ProductFormDialog` to fetch `ProductDetail` via `useProduct(id)`
   instead of reusing the table row.
6. **Real AI wiring** per `business/ai-registry.ts` — today only
   `sales-forecast`/`smart-reorder` (via the existing Gemini-backed
   `ai-forecast-service.ts`) are real; the rest are described but not
   implemented. Each entry there is a scoped, independently-shippable
   unit of work.
7. Longer-term, per the original brief: extract `business/`, `lib/auth`,
   and each `features/<domain>` into clearer domain boundaries
   (api/service/repository/types per domain) if/when this needs to split
   into services — the `storeId` scoping discipline already in place is
   the hard prerequisite for that, and it was already solid before this
   change.

## 6. Verification performed

- `npx tsc --noEmit` — clean (0 errors) across the full project after this
  change, run against a fresh `npm install`.
- `npx drizzle-kit generate` — schema compiles and produces valid MySQL
  DDL; output saved at `drizzle/0000_business_template_engine.sql`.
- No live MySQL instance in this environment, so `db:push`/`db:seed` and
  runtime/browser testing were not exercised — do this before deploying.
