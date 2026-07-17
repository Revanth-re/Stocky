/**
 * Static seed catalog used to auto-populate a new store's product list
 * during onboarding (Step 3-4). In production this mirrors the `brands`
 * and a `is_global` slice of `products` in MySQL — kept here as a typed
 * constant so onboarding works even before the DB is seeded.
 */
export type GlobalBrand = {
  slug: string;
  name: string;
  color: string;
};

export type GlobalCatalogProduct = {
  id: string;
  name: string;
  brandSlug: string;
  category: string;
  unit: string;
  packSize: string;
  suggestedSellingPrice: number;
  minStock: number;
  imageEmoji: string;
};

export const GLOBAL_BRANDS: GlobalBrand[] = [
  { slug: "amul", name: "Amul", color: "#E4002B" },
  { slug: "nestle", name: "Nestlé", color: "#78B833" },
  { slug: "coca-cola", name: "Coca-Cola", color: "#F40009" },
  { slug: "pepsi", name: "Pepsi", color: "#004B93" },
  { slug: "britannia", name: "Britannia", color: "#E31937" },
  { slug: "tata", name: "Tata", color: "#0F1B7F" },
  { slug: "itc", name: "ITC", color: "#8B4513" },
  { slug: "hul", name: "HUL", color: "#1F4E8C" },
  { slug: "pg", name: "P&G", color: "#0033A0" },
];

export const GLOBAL_CATALOG: GlobalCatalogProduct[] = [
  { id: "amul-milk-500ml", name: "Amul Milk Packet 500ml", brandSlug: "amul", category: "Dairy", unit: "packet", packSize: "500ml", suggestedSellingPrice: 32, minStock: 10, imageEmoji: "🥛" },
  { id: "amul-butter-100g", name: "Amul Butter 100g", brandSlug: "amul", category: "Dairy", unit: "packet", packSize: "100g", suggestedSellingPrice: 58, minStock: 8, imageEmoji: "🧈" },
  { id: "nestle-maggi-70g", name: "Maggi Noodles 70g", brandSlug: "nestle", category: "Snacks", unit: "packet", packSize: "70g", suggestedSellingPrice: 14, minStock: 15, imageEmoji: "🍜" },
  { id: "nestle-nescafe-50g", name: "Nescafé Classic 50g", brandSlug: "nestle", category: "Beverages", unit: "jar", packSize: "50g", suggestedSellingPrice: 145, minStock: 6, imageEmoji: "☕" },
  { id: "coke-750ml", name: "Coca-Cola 750ml", brandSlug: "coca-cola", category: "Beverages", unit: "bottle", packSize: "750ml", suggestedSellingPrice: 40, minStock: 12, imageEmoji: "🥤" },
  { id: "coke-sprite-750ml", name: "Sprite 750ml", brandSlug: "coca-cola", category: "Beverages", unit: "bottle", packSize: "750ml", suggestedSellingPrice: 40, minStock: 10, imageEmoji: "🥤" },
  { id: "pepsi-750ml", name: "Pepsi 750ml", brandSlug: "pepsi", category: "Beverages", unit: "bottle", packSize: "750ml", suggestedSellingPrice: 40, minStock: 10, imageEmoji: "🥤" },
  { id: "lays-classic-52g", name: "Lay's Classic 52g", brandSlug: "pepsi", category: "Snacks", unit: "packet", packSize: "52g", suggestedSellingPrice: 20, minStock: 15, imageEmoji: "🍟" },
  { id: "britannia-goodday-100g", name: "Britannia Good Day 100g", brandSlug: "britannia", category: "Biscuits", unit: "packet", packSize: "100g", suggestedSellingPrice: 30, minStock: 12, imageEmoji: "🍪" },
  { id: "parle-g-100g", name: "Parle-G Biscuit 100g", brandSlug: "britannia", category: "Biscuits", unit: "packet", packSize: "100g", suggestedSellingPrice: 10, minStock: 20, imageEmoji: "🍪" },
  { id: "tata-salt-1kg", name: "Tata Salt 1kg", brandSlug: "tata", category: "Grocery", unit: "packet", packSize: "1kg", suggestedSellingPrice: 28, minStock: 20, imageEmoji: "🧂" },
  { id: "tata-tea-250g", name: "Tata Tea Gold 250g", brandSlug: "tata", category: "Beverages", unit: "packet", packSize: "250g", suggestedSellingPrice: 130, minStock: 8, imageEmoji: "🍵" },
  { id: "itc-aashirvaad-5kg", name: "Aashirvaad Atta 5kg", brandSlug: "itc", category: "Grocery", unit: "bag", packSize: "5kg", suggestedSellingPrice: 260, minStock: 6, imageEmoji: "🌾" },
  { id: "itc-bingo-90g", name: "Bingo Mad Angles 90g", brandSlug: "itc", category: "Snacks", unit: "packet", packSize: "90g", suggestedSellingPrice: 20, minStock: 15, imageEmoji: "🍿" },
  { id: "hul-surf-excel-1kg", name: "Surf Excel 1kg", brandSlug: "hul", category: "Household", unit: "packet", packSize: "1kg", suggestedSellingPrice: 135, minStock: 8, imageEmoji: "🧺" },
  { id: "hul-lux-soap", name: "Lux Soap Bar 100g", brandSlug: "hul", category: "Personal Care", unit: "pcs", packSize: "100g", suggestedSellingPrice: 40, minStock: 20, imageEmoji: "🧼" },
  { id: "pg-tide-1kg", name: "Tide Detergent 1kg", brandSlug: "pg", category: "Household", unit: "packet", packSize: "1kg", suggestedSellingPrice: 120, minStock: 8, imageEmoji: "🧺" },
  { id: "pg-gillette-razor", name: "Gillette Guard Razor", brandSlug: "pg", category: "Personal Care", unit: "pcs", packSize: "1 pc", suggestedSellingPrice: 55, minStock: 10, imageEmoji: "🪒" },
];

export function getCatalogForBrands(brandSlugs: string[]) {
  return GLOBAL_CATALOG.filter((product) => brandSlugs.includes(product.brandSlug));
}
