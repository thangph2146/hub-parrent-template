import { api } from "@/lib/api";
import {
  cartLineKey,
  cartStore,
  type CartLine,
} from "@/hooks/use-cart";
import type { CustomerCartLine } from "@workspace/api-client";

const SESSION_KEY = "storesync_session";

let lastHydratedUserId: string | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;

function readSessionUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as { id?: string };
    return s.id?.trim() || null;
  } catch {
    return null;
  }
}

function toPersistedLine(line: CartLine): CustomerCartLine {
  const { stock, ...rest } = line;
  void stock;
  return rest;
}

function remoteToCartLine(line: CustomerCartLine): CartLine {
  return { ...line, stock: 0 };
}

function mergeCartLines(local: CartLine[], remote: CartLine[]): CartLine[] {
  const map = new Map<string, CartLine>();
  for (const line of [...remote, ...local]) {
    const key = cartLineKey(line.productId, line.unitType);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, { ...line, stock: line.stock ?? 0 });
      continue;
    }
    map.set(key, {
      ...prev,
      ...line,
      quantity: Math.max(prev.quantity, line.quantity),
      stock: Math.max(prev.stock ?? 0, line.stock ?? 0),
    });
  }
  return [...map.values()];
}

export function resetCartHydration(): void {
  lastHydratedUserId = null;
}

export async function pullUserCart(): Promise<{
  lines: CartLine[];
  appliedPromoCode: string | null;
}> {
  const res = await api.carts.getMine();
  return {
    lines: (res.lines ?? []).map(remoteToCartLine),
    appliedPromoCode: res.appliedPromoCode ?? null,
  };
}

export async function pushUserCart(): Promise<void> {
  if (!readSessionUserId()) return;
  const state = cartStore.getState();
  await api.carts.saveMine({
    lines: state.lines.map(toPersistedLine),
    appliedPromoCode: state.appliedPromoCode,
  });
}

/** Debounce đẩy giỏ lên server khi user đã đăng nhập. */
export function schedulePushUserCart(delayMs = 800): void {
  if (!readSessionUserId()) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushUserCart().catch(() => {});
  }, delayMs);
}

/** Xoá giỏ server (sau checkout thành công). */
export async function clearServerCart(): Promise<void> {
  if (!readSessionUserId()) return;
  try {
    await api.carts.clearMine();
  } catch {
    /* migration chưa chạy hoặc offline */
  }
}

/**
 * Sau đăng nhập / refresh: gộp giỏ local với server.
 * Cả hai có dữ liệu → merge theo khóa SP+đơn vị; server trống → đẩy local lên.
 */
export async function hydrateCartAfterLogin(): Promise<void> {
  const userId = readSessionUserId();
  if (!userId) return;
  if (lastHydratedUserId === userId) return;

  try {
    const local = cartStore.getState();
    const remote = await pullUserCart();

    if (remote.lines.length > 0 && local.lines.length > 0) {
      cartStore.replaceState({
        lines: mergeCartLines(local.lines, remote.lines),
        appliedPromoCode:
          local.appliedPromoCode ?? remote.appliedPromoCode ?? null,
      });
      await pushUserCart();
    } else if (remote.lines.length > 0) {
      cartStore.replaceState({
        lines: remote.lines,
        appliedPromoCode: remote.appliedPromoCode,
      });
    } else if (local.lines.length > 0) {
      await pushUserCart();
    }

    lastHydratedUserId = userId;
  } catch {
    /* giữ giỏ local */
  }
}
