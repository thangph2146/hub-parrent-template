/** Các bảng con / pivot import cùng request với bảng cha (một transaction). */
export const IMPORT_MODEL_BUNDLES: Record<string, readonly string[]> = {
  user: ['userRole'],
  post: ['postCategory', 'postTag'],
  event: ['eventSpeaker', 'eventRegistration'],
};

/** Thứ tự xóa trước import — RBAC bundle: role xóa user_roles trước, bỏ clear userRole riêng. */
export function resolveImportClearOrder(
  modelNames: string[],
  modelOrder: readonly string[],
): string[] {
  const set = new Set(modelNames);
  const hasRbacBundle =
    set.has('role') && set.has('user') && set.has('userRole');
  if (hasRbacBundle) {
    const out: string[] = [];
    if (set.has('role')) out.push('role');
    if (set.has('user')) out.push('user');
    for (const m of modelOrder) {
      if (set.has(m) && m !== 'role' && m !== 'user' && m !== 'userRole') {
        out.push(m);
      }
    }
    return out;
  }
  return modelOrder.filter((m) => set.has(m));
}

/** Thứ tự an toàn FK khi mỗi lần chỉ import một bảng (vd. role → user → userRole). */
export function orderModelsForDependencySafeImport(
  models: string[],
  modelOrder: readonly string[],
): string[] {
  const set = new Set(models);
  const out: string[] = [];
  const take = (m: string) => {
    if (set.has(m)) {
      out.push(m);
      set.delete(m);
    }
  };
  take('role');
  take('user');
  take('userRole');
  for (const m of [...modelOrder].reverse()) {
    take(m);
  }
  for (const m of set) {
    out.push(m);
  }
  return out;
}

export function appendImportBundleToPayload(
  data: Record<string, unknown[]>,
  primary: string,
  payload: Record<string, unknown[]>,
  skipModels: Set<string>,
): string[] {
  const bundled: string[] = [];
  for (const extra of IMPORT_MODEL_BUNDLES[primary] ?? []) {
    if (skipModels.has(extra)) continue;
    if (!Object.prototype.hasOwnProperty.call(data, extra)) continue;
    payload[extra] = Array.isArray(data[extra]) ? data[extra] : [];
    skipModels.add(extra);
    bundled.push(extra);
  }
  return bundled;
}
