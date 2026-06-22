/**
 * Registry target app theo product line (metadata cho generator/verify).
 * Template upstream không chứa apps/ — các path là convention cho downstream.
 */

/** @typedef {{ path: string; package: string; port?: number }} AppEntry */

/** @type {Record<string, Record<string, AppEntry>>} */
const PRODUCT_LINES = {
  main: {
    api: { path: "apps/main/api", package: "@api", port: 3002 },
    backend: { path: "apps/main/backend", package: "@backend", port: 3001 },
  },
  "hub-parent": {
    api: { path: "apps/hub-parent/api", package: "@hub-parent/api", port: 3002 },
    frontend: {
      path: "apps/hub-parent/hub-parent-frontend",
      package: "@frontend",
      port: 3000,
    },
  },
  "hub-checkin": {
    api: { path: "apps/hub-checkin/api", package: "@hub-checkin/api", port: 3002 },
    frontend: {
      path: "apps/hub-checkin/hub-checkin-frontend",
      package: "@hub-checkin/frontend",
      port: 3000,
    },
  },
  "store-sync": {
    api: { path: "apps/store-sync/api", package: "@store-sync/api", port: 3002 },
    frontend: {
      path: "apps/store-sync/store-sync-frontend",
      package: "@store-sync-frontend",
      port: 3000,
    },
  },
};

/** Product line kế thừa source API từ main. */
const API_INHERITS_FROM_MAIN = ["hub-checkin", "hub-parent", "store-sync"];

/** Next apps — kiểm tra sdk.http. */
const NEXT_APP_PATHS = [
  PRODUCT_LINES.main.backend.path,
  PRODUCT_LINES["hub-parent"].frontend.path,
  PRODUCT_LINES["hub-checkin"].frontend.path,
  PRODUCT_LINES["store-sync"].frontend.path,
];

/** Canonical permissions (source of truth). */
const MAIN_API_PERMISSIONS = "apps/main/api/src/config/permissions.ts";

module.exports = {
  PRODUCT_LINES,
  API_INHERITS_FROM_MAIN,
  NEXT_APP_PATHS,
  MAIN_API_PERMISSIONS,
  MAIN_API_PATH: PRODUCT_LINES.main.api.path,
};
