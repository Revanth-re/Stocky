/**
 * Free, no-API-key barcode lookup via OpenFoodFacts — used to auto-fill
 * product name / category / pack size when a store owner scans a new
 * product's barcode while adding it to the catalog. Best coverage on
 * packaged groceries/FMCG; returns null for anything it doesn't recognize
 * (the product form just falls back to manual entry in that case).
 */
export type OpenFoodFactsProduct = {
  name: string | null;
  brand: string | null;
  category: string | null;
  quantity: string | null;
  imageUrl: string | null;
};

export async function lookupBarcodeProduct(barcode: string): Promise<OpenFoodFactsProduct | null> {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`, {
      headers: { "User-Agent": "KiranaAI-InventorySaaS/1.0 (contact: support@kiranaai.app)" },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      status?: number;
      product?: {
        product_name?: string;
        product_name_en?: string;
        brands?: string;
        categories?: string;
        quantity?: string;
        image_front_small_url?: string;
        image_url?: string;
      };
    };

    if (data.status !== 1 || !data.product) return null;
    const p = data.product;
    const firstCategory = p.categories ? p.categories.split(",")[0]?.trim().replace(/^en:/, "") : null;

    return {
      name: p.product_name || p.product_name_en || null,
      brand: p.brands ? p.brands.split(",")[0]?.trim() ?? null : null,
      category: firstCategory || null,
      quantity: p.quantity || null,
      imageUrl: p.image_front_small_url || p.image_url || null,
    };
  } catch (error) {
    console.error("[lib/openfoodfacts]", error);
    return null;
  }
}
