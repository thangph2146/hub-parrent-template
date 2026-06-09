import { getProductUnits, hasUnitWholesalePromo } from "@workspace/api-client";
import type { Product } from "@/lib/api";

export { getProductUnits };

/** Điểm ưu tiên khi có từ khóa (cao hơn = hiển thị trước). */
export function scoreProductSearchMatch(p: Product, qRaw: string): number {
  const q = qRaw.trim().toLowerCase();
  if (!q) return 0;
  const sku = p.sku.toLowerCase();
  const name = p.name.toLowerCase();
  const brand = (p.brand ?? "").toLowerCase();
  const cat = p.category.toLowerCase();
  const desc = (p.description ?? "").toLowerCase();
  const origin = (p.origin ?? "").toLowerCase();
  if (sku === q) return 100;
  if (sku.startsWith(q)) return 92;
  if (sku.includes(q)) return 88;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 70;
  if (brand.includes(q)) return 55;
  if (cat.includes(q)) return 45;
  if (origin.includes(q)) return 38;
  if (desc.includes(q)) return 32;
  return 0;
}

export function productMatchesCatalogFilters(
  p: Product,
  opts: {
    q: string;
    categoryTab: string;
    purchaseType: string;
    unitFilter: string;
  },
): boolean {
  const q = opts.q.trim().toLowerCase();
  const matchSearch =
    !q ||
    scoreProductSearchMatch(p, q) > 0 ||
    getProductUnits(p).some((u) =>
      [u.type, u.label].some((t) => t.toLowerCase().includes(q)),
    );

  const matchCategory =
    opts.categoryTab === "ALL" || p.category === opts.categoryTab;

  const units = getProductUnits(p);
  const hasWholesale = units.some((u) => hasUnitWholesalePromo(u));
  const hasRetail = units.some((u) => !hasUnitWholesalePromo(u));
  const matchPurchase =
    opts.purchaseType === "ALL" ||
    (opts.purchaseType === "si" && hasWholesale) ||
    (opts.purchaseType === "le" && hasRetail);

  const matchUnit =
    opts.unitFilter === "ALL" ||
    units.some((u) => u.type === opts.unitFilter);

  return matchSearch && matchCategory && matchPurchase && matchUnit;
}
