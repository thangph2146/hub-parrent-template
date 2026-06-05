import type { GuideGroup, GuideStep } from "./types";

export const PAGE_KEY = "huong-dan-su-dung";

/**
 * Parse content JSON từ API về dạng object chuẩn.
 * Dùng type từ @workspace/api-client để đảm bảo consistency.
 */
export function parseContent(raw: unknown): NonNullable<GuideGroup["content"]> {
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return { title: null, description: null, order: 0, steps: [] };
    }
  }
  if (raw == null || typeof raw !== "object") {
    return { title: null, description: null, order: 0, steps: [] };
  }
  const r = raw as Record<string, unknown>;
  return {
    title: typeof r.title === "string" ? r.title : null,
    description: typeof r.description === "string" ? r.description : null,
    order: typeof r.order === "number" ? r.order : 0,
    steps: Array.isArray(r.steps)
      ? (r.steps as Record<string, unknown>[]).map((s, i) => ({
          order: typeof s.order === "number" ? s.order : i + 1,
          title: typeof s.title === "string" ? s.title : "",
          description: typeof s.description === "string" ? s.description : "",
          imageUrl: typeof s.imageUrl === "string" ? s.imageUrl : null,
        }))
      : [],
  };
}

/** Sắp xếp groups theo order trong content */
export function sortGroupsByOrder(groups: GuideGroup[]): GuideGroup[] {
  return [...groups].sort(
    (a, b) => (parseContent(a.content).order ?? 0) - (parseContent(b.content).order ?? 0)
  );
}

/** Gán content.order theo vị trí trong mảng (sau drag-and-drop). */
export function applyOrderToGroups(groups: GuideGroup[]): GuideGroup[] {
  return groups.map((grp, idx) => {
    const content = parseContent(grp.content);
    return {
      ...grp,
      content: { ...content, order: idx + 1 },
    };
  });
}

/** Reorder steps sau khi drag-drop */
export function reorderSteps(steps: GuideStep[]): GuideStep[] {
  return steps.map((s, idx) => ({ ...s, order: idx + 1 }));
}
