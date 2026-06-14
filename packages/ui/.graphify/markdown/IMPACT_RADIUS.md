# Bán kính ảnh hưởng import — packages/ui (Graphify)

> **Sinh tự động:** `2026-06-13T21:25:57.519Z` từ `../snapshot/graph.json` — file **in-degree cao** = nhiều nơi import; sửa cần kiểm tra downstream.

Graphify chỉ quét **import tĩnh** trong `src/`; không thấy Nest DI, dynamic import, hay route Next theo convention.

## Top file theo số nguồn import (in-degree)

| File | Số importer | Mẫu importer (tối đa 6) |
|------|-------------|-------------------------|
| `src/lib/utils.ts` | 121 | `src/components/accordion.tsx`, `src/components/admin/forms/admin-form-badge.tsx`, `src/components/admin/forms/image-url-list-field.tsx`, `src/components/admin/forms/product-form-sidebar.tsx`, `src/components/admin/forms/product-unit-gift-field.tsx`, `src/components/admin/forms/product-unit-promo-compact.tsx` |
| `src/components/button.tsx` | 36 | `src/components/admin/forms/image-url-list-field.tsx`, `src/components/admin/forms/product-unit-gift-field.tsx`, `src/components/admin/pages/admin-page-header-buttons.tsx`, `src/components/admin/presets/admin-config-copy-button.tsx`, `src/components/admin/presets/admin-quick-presets.tsx`, `src/components/admin/shell/access-denied-panel.tsx` |
| `src/components/badge.tsx` | 23 | `src/components/admin/forms/admin-form-badge.tsx`, `src/components/admin/forms/product-form-sidebar.tsx`, `src/components/admin/forms/product-unit-stock-pool.tsx`, `src/components/admin/pages/admin-media-gallery.tsx`, `src/components/admin/pages/admin-tab-count-badge.tsx`, `src/components/admin/shell/access-denied-panel.tsx` |
| `src/components/input.tsx` | 13 | `src/components/admin/forms/image-url-list-field.tsx`, `src/components/admin/forms/product-form-sidebar.tsx`, `src/components/data-table/data-table-pagination.tsx`, `src/components/data-table/data-table-toolbar.tsx`, `src/components/data-table/data-table-user-search-filter.tsx`, `src/components/data-table/data-table.tsx` |
| `src/lib/layout-shell.ts` | 11 | `src/components/admin/pages/admin-detail-layout.tsx`, `src/components/admin/pages/admin-detail-page-header.tsx`, `src/components/admin/pages/admin-form-layout.tsx`, `src/components/admin/pages/admin-form-page-header.tsx`, `src/components/admin/pages/admin-list-page-header.tsx`, `src/components/admin/pages/admin-page-header-buttons.tsx` |
| `src/components/admin/types.ts` | 10 | `src/components/admin/index.ts`, `src/components/admin/integration/admin-branding-fallbacks.ts`, `src/components/admin/integration/admin-layout-bridge.tsx`, `src/components/admin/integration/build-admin-layout-value.ts`, `src/components/admin/integration/fetch-settings-branding.ts`, `src/components/admin/integration/use-admin-public-site-seo.ts` |
| `src/components/badge-presets.tsx` | 10 | `src/components/index.ts`, `src/components/product/index.ts`, `src/components/product/order-admin-edit-form.tsx`, `src/components/product/order-admin-status-picker.tsx`, `src/components/product/product-admin-detail.tsx`, `src/components/product/product-detail-order-row.tsx` |
| `src/components/field.tsx` | 10 | `src/components/admin/forms/product-form-sidebar.tsx`, `src/components/auth/dev-login-account-field.tsx`, `src/components/data-table/data-table.tsx`, `src/components/index.ts`, `src/components/product/order-admin-detail.tsx`, `src/components/product/order-admin-edit-form.tsx` |
| `src/components/product/product-money.ts` | 10 | `src/components/product/index.ts`, `src/components/product/order-admin-edit-form.tsx`, `src/components/product/order-admin-line-item.tsx`, `src/components/product/order-admin-payment-summary.tsx`, `src/components/product/product-admin-detail.tsx`, `src/components/product/product-detail-order-row.tsx` |
| `src/components/data-table/table-row-actions.tsx` | 9 | `src/components/data-table/data-table-column-visibility.ts`, `src/components/data-table/data-table-column-width.ts`, `src/components/data-table/data-table-columns.ts`, `src/components/data-table/data-table-row-actions-registry.tsx`, `src/components/data-table/data-table-row-context-menu.tsx`, `src/components/data-table/index.ts` |
| `src/components/admin/storage/types.ts` | 8 | `src/components/admin/storage/admin-storage-image-picker-dialog.tsx`, `src/components/admin/storage/admin-storage-picker-columns.tsx`, `src/components/admin/storage/admin-storage-picker-panel.tsx`, `src/components/admin/storage/admin-storage-picker-row-actions.tsx`, `src/components/admin/storage/admin-storage-picker-table.tsx`, `src/components/admin/storage/index.ts` |
| `src/components/popover.tsx` | 8 | `src/components/index.ts`, `src/components/pickers/date-picker.tsx`, `src/components/pickers/date-range-picker.tsx`, `src/components/pickers/icon-picker.tsx`, `src/components/pickers/multi-select-picker.tsx`, `src/components/pickers/select-picker.tsx` |
| `src/components/collapsible.tsx` | 7 | `src/components/admin/forms/image-url-list-field.tsx`, `src/components/admin/forms/product-form-sidebar.tsx`, `src/components/admin/forms/product-unit-promo-section.tsx`, `src/components/admin/shell/sidebar.tsx`, `src/components/graphify/graphify-page.tsx`, `src/components/index.ts` |
| `src/components/pickers/picker-trigger-styles.ts` | 7 | `src/components/pickers/date-picker.tsx`, `src/components/pickers/date-range-picker.tsx`, `src/components/pickers/multi-select-picker.tsx`, `src/components/pickers/number-range-picker.tsx`, `src/components/pickers/select-picker.tsx`, `src/components/pickers/tree-multi-select-picker.tsx` |
| `src/svg/thesvg-icon.tsx` | 7 | `src/svg/archive-icon.tsx`, `src/svg/excel-icon.tsx`, `src/svg/index.ts`, `src/svg/pdf-icon.tsx`, `src/svg/powerpoint-icon.tsx`, `src/svg/thesvg-sources/types.d.ts` |
| `src/components/data-table/row-action-confirm.tsx` | 6 | `src/components/admin/presets/index.ts`, `src/components/data-table/data-table-row-actions-registry.tsx`, `src/components/data-table/data-table-row-context-menu.tsx`, `src/components/data-table/index.ts`, `src/components/data-table/table-row-actions-menu.tsx`, `src/components/data-table/table-row-actions.tsx` |
| `src/components/label.tsx` | 6 | `src/components/admin/forms/product-unit-promo-section.tsx`, `src/components/auth/dev-login-account-field.tsx`, `src/components/dialogs/panel-dialog.tsx`, `src/components/field.tsx`, `src/components/index.ts`, `src/components/typing/form-field.tsx` |
| `src/components/sonner.tsx` | 6 | `src/components/admin/presets/admin-config-copy-button.tsx`, `src/components/admin/shell/access-denied-panel.tsx`, `src/components/admin/storage/admin-storage-picker-panel.tsx`, `src/components/admin/storage/use-admin-storage-picker-list.ts`, `src/components/index.ts`, `src/components/site/site-root-providers.tsx` |
| `src/lib/resolve-media-url.ts` | 6 | `src/components/admin/forms/image-url-list-field.tsx`, `src/components/admin/forms/product-unit-gift-field.tsx`, `src/components/admin/forms/product-unit-promo-section.tsx`, `src/components/admin/pages/admin-media-gallery.tsx`, `src/components/product/product-detail-gallery.tsx`, `src/components/product/product-detail-promo-gifts-section.tsx` |
| `src/components/admin/pages/admin-detail-layout.tsx` | 5 | `src/components/admin/pages/admin-page-skeletons.tsx`, `src/components/admin/pages/index.ts`, `src/components/product/order-admin-detail.tsx`, `src/components/product/product-admin-detail.tsx`, `src/components/product/promo-admin-detail.tsx` |
| `src/components/admin/shell/layout-context.tsx` | 5 | `src/components/admin/index.ts`, `src/components/admin/integration/admin-layout-bridge.tsx`, `src/components/admin/shell/page-guard.tsx`, `src/components/admin/shell/shell.tsx`, `src/components/admin/shell/sidebar.tsx` |
| `src/components/data-table/data-table-row-actions-registry.tsx` | 5 | `src/components/data-table/data-table-row-context-menu.tsx`, `src/components/data-table/data-table.tsx`, `src/components/data-table/index.ts`, `src/components/data-table/table-row-actions-menu.tsx`, `src/components/data-table/table-row-actions.tsx` |
| `src/components/data-table/row-actions-menu-shared.tsx` | 5 | `src/components/data-table/data-table-row-actions-registry.tsx`, `src/components/data-table/data-table-row-context-menu.tsx`, `src/components/data-table/index.ts`, `src/components/data-table/table-row-actions-menu.tsx`, `src/components/data-table/table-row-actions.tsx` |
| `src/components/dialog.tsx` | 5 | `src/components/admin/storage/admin-storage-image-picker-dialog.tsx`, `src/components/command.tsx`, `src/components/dialogs/panel-dialog.tsx`, `src/components/image-lightbox.tsx`, `src/components/index.ts` |
| `src/components/dropdown-menu.tsx` | 5 | `src/components/admin/shell/shell.tsx`, `src/components/data-table/table-row-actions-menu.tsx`, `src/components/index.ts`, `src/components/menubar.tsx`, `src/components/product/order-admin-status-picker.tsx` |

## `src/common/` — tiện ích dùng chung

- (không có file common in-degree ≥ 2)

## Entity / types (`**/entities/**`)

- (không có entity in-degree ≥ 2)

## Gợi ý agent

1. Trước khi sửa file in-degree cao → mở mẫu importer ở bảng trên hoặc grep trong app.
2. Sau refactor export/type → chạy `pnpm check` + `graphify-update` app này nếu đổi cấu trúc import.
3. So sánh với [`GRAPH_STATS.md`](GRAPH_STATS.md) (cùng thư mục) — out-degree vs in-degree.

## Làm mới

`node script-system/graphify/graphify-update.cjs packages/ui` → `pnpm graphify:ai-summary`.
