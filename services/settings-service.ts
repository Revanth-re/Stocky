import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { settings, stores } from "@/db/schema";
import type { BusinessTemplate } from "@/db/schema";
import { getBusinessTemplate } from "@/business/registry";
import { GLOBAL_AI_FEATURES } from "@/business/ai-registry";
import { CORE_MODULES } from "@/business/core-modules";
import { resolveEnabledModuleIds, resolveEnabledAiFeatureIds } from "@/business/types";

/**
 * AI features with a real model/logic behind the toggle today. Everything
 * else in `business/ai-registry.ts` is a described-but-not-implemented
 * capability — the toggle exists so the settings surface and future model
 * wiring don't need rework, but flipping it doesn't change app behavior
 * yet. Surfaced to the Settings > Modules UI as a "Live"/"Not wired yet"
 * badge so that's honest instead of implied. See ARCHITECTURE.md.
 */
const IMPLEMENTED_AI_FEATURE_IDS = new Set(["sales-forecast", "smart-reorder", "barcode-recognition"]);

export async function getSetting<T>(storeId: string, category: string, key: string): Promise<T | null> {
  const row = await db.query.settings.findFirst({
    where: and(eq(settings.storeId, storeId), eq(settings.category, category), eq(settings.key, key)),
  });
  return (row?.value as T) ?? null;
}

export async function listSettingsByCategory(storeId: string, category: string) {
  return db.query.settings.findMany({ where: and(eq(settings.storeId, storeId), eq(settings.category, category)) });
}

export async function upsertSetting(storeId: string, category: string, key: string, value: unknown) {
  const existing = await db.query.settings.findFirst({
    where: and(eq(settings.storeId, storeId), eq(settings.category, category), eq(settings.key, key)),
  });

  if (existing) {
    await db.update(settings).set({ value }).where(eq(settings.id, existing.id));
  } else {
    await db.insert(settings).values({ storeId, category, key, value });
  }
}

export async function getStoreProfile(storeId: string) {
  return db.query.stores.findFirst({ where: eq(stores.id, storeId) });
}

export async function updateStoreProfile(
  storeId: string,
  input: {
    name: string;
    ownerName: string;
    phone: string;
    gstNumber?: string;
    upiId?: string;
    address?: string;
    businessTemplate?: BusinessTemplate;
  },
) {
  await db
    .update(stores)
    .set({
      name: input.name,
      ownerName: input.ownerName,
      phone: input.phone,
      gstNumber: input.gstNumber || null,
      upiId: input.upiId || null,
      address: input.address || null,
      businessTemplate: input.businessTemplate,
    })
    .where(eq(stores.id, storeId));
}

/**
 * Read model for Settings > Modules: the active template's optional
 * sidebar modules and every AI feature (global + template-specific), each
 * flagged with whether it's currently enabled for this tenant. Powers the
 * toggle UI that's the primary way `custom`-template tenants shape their
 * app, and how any template's tenant turns individual extras on/off.
 */
export async function getModulesSettingsView(storeId: string) {
  const store = await db.query.stores.findFirst({ where: eq(stores.id, storeId) });
  const businessTemplate = store?.businessTemplate ?? "grocery";
  const config = getBusinessTemplate(businessTemplate);

  const allAiFeatures = [...GLOBAL_AI_FEATURES, ...config.aiFeatures];
  const enabledModuleIds = resolveEnabledModuleIds(config, store?.enabledModules);
  const enabledAiFeatureIds = resolveEnabledAiFeatureIds(allAiFeatures, store?.enabledAiFeatures);

  return {
    businessTemplate,
    templateLabel: config.label,
    coreModules: CORE_MODULES.filter((m) => !m.comingSoon).map((m) => ({ id: m.id, label: m.label, alwaysOn: true })),
    templateModules: config.sidebarModules.map((m) => ({
      id: m.id,
      label: m.label,
      comingSoon: m.comingSoon ?? false,
      enabled: enabledModuleIds.has(m.id),
    })),
    aiFeatures: allAiFeatures.map((f) => ({
      id: f.id,
      label: f.label,
      description: f.description,
      enabled: enabledAiFeatureIds.has(f.id),
      implemented: IMPLEMENTED_AI_FEATURE_IDS.has(f.id),
    })),
  };
}

/**
 * Updates which optional modules / AI features are enabled for this
 * tenant. `null` resets to "use the active template's defaults" (see
 * `business/types.ts#resolveEnabledModuleIds`). Powers Settings > Modules —
 * the primary way the `custom` template becomes usable, and lets any
 * template turn individual extras on/off.
 */
export async function updateEnabledModules(
  storeId: string,
  input: { enabledModules?: string[] | null; enabledAiFeatures?: string[] | null },
) {
  const result = await db
    .update(stores)
    .set({
      ...(input.enabledModules !== undefined ? { enabledModules: input.enabledModules } : {}),
      ...(input.enabledAiFeatures !== undefined ? { enabledAiFeatures: input.enabledAiFeatures } : {}),
    })
    .where(eq(stores.id, storeId));

  // mysql2's OkPacket result — surfaces as `result[0]` through Drizzle's mysql2 driver.
  const affectedRows = (result as unknown as [{ affectedRows?: number }])[0]?.affectedRows;

  // A toggle that reports success in the UI but reverts on the next read is exactly what
  // happens if this UPDATE matched zero rows (storeId in the session cookie no longer points
  // at a real `stores` row — e.g. after a `DROP DATABASE` + reseed during dev, since a JWT
  // issued before that still carries the old, now-nonexistent, storeId). MySQL does not error
  // on a 0-row UPDATE, so without this check the request silently no-ops and reports
  // `{ success: true }` anyway. Fail loudly instead so this shows up as a toast, not a mystery.
  if (affectedRows === 0) {
    throw new Error(
      `No store row matched id "${storeId}" — your session may be stale (e.g. pointing at a store that no longer exists after a database reset). Try logging out and back in.`,
    );
  }
}
