/**
 * Ranh giới phụ thuộc giữa “service” trong monorepo (API Nest, Next apps, package TS/React).
 * Dùng với ESLint flat config — `no-restricted-imports` theo pattern.
 *
 * Mỗi khối `no-restricted-imports` gom đủ pattern trong một object để tránh ghi đè rule
 * khi nhiều config cùng match một file (flat config).
 */

/** Trong RegExp: khớp `/` hoặc `\` (đường dẫn import). */
const pathSep = "[/\\\\]";

/** Khớp chuỗi import chứa segment app (`apps/<tên>` hoặc `apps/<line>/<tên>`). */
const reAppsPath = (/** @type {string} */ segment) =>
  `${pathSep}apps(?:${pathSep}[^/\\\\]+)?${pathSep}${segment}(?:${pathSep}|$)`;

/** Khớp import kiểu đường dẫn tệp vào thư mục gốc `packages/` (bypass alias workspace). */
const reMonorepoPackagesPath = `${pathSep}packages${pathSep}`;

const noFilePathToMonorepoPackages = {
  regex: reMonorepoPackagesPath,
  message:
    "Không import qua đường dẫn `.../packages/...` — thêm `workspace:*` và dùng `@workspace/*`, `@ui`, hoặc alias `@/*`.",
};

/** @type {import("eslint").Linter.Config[]} */
export const apiServiceBoundary = [
  {
    name: "store-sync/boundary-api",
    files: ["src/**/*.ts", "test/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "next",
                "next/*",
                "@next/*",
                "react",
                "react-dom",
                "react-dom/*",
              ],
              message:
                "@api (Nest) không được import Next/React — ranh giới service; client dùng HTTP/SDK.",
            },
            {
              group: ["@workspace/api-client", "@workspace/api-client/*"],
              message:
                "@api không import @workspace/api-client (gói đó dành cho BFF/client).",
            },
            {
              group: [
                "@frontend",
                "@frontend/*",
                "@backend",
                "@backend/*",
                "@ui",
                "@ui/*",
              ],
              message:
                "@api không import app Next (@frontend/@backend) hay @ui — chỉ package neutral / Nest.",
            },
            {
              regex: `(?:${reAppsPath("frontend")}|${reAppsPath("backend")})`,
              message:
                "Không import qua đường dẫn tệp vào apps/frontend hay apps/backend — ranh giới service.",
            },
            noFilePathToMonorepoPackages,
          ],
        },
      ],
    },
  },
];

const nextForbiddenServerStack = {
  group: ["@nestjs/*", "@mikro-orm/*"],
  message:
    "Next không import Nest/MikroORM — chỉ @workspace/api-client hoặc HTTP.",
};

/** Cấm gọi `sdk.http` trực tiếp trong app Next — dùng resource API (`api.users.bulk`, …). */
export const noRawSdkHttpSyntaxSelector = {
  selector:
    "MemberExpression[object.type='Identifier'][object.name=/^(api|apiClient|sdk)$/][property.name='http']",
  message:
    "Không gọi sdk.http trực tiếp — dùng resource trên StoreSyncSdk (vd. api.users.bulk, api.public.listPosts).",
};

/** @type {import("eslint").Linter.Config} */
const nextNoRawSdkHttpBoundary = {
  name: "store-sync/no-raw-sdk-http",
  files: ["src/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-syntax": ["error", noRawSdkHttpSyntaxSelector],
  },
};

/**
 * Storefront Next (@frontend): không kéo admin app hay stack server.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nextFrontendServiceBoundary = [
  nextNoRawSdkHttpBoundary,
  {
    name: "store-sync/boundary-next-frontend",
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            nextForbiddenServerStack,
            {
              group: [
                "@backend",
                "@backend/*",
                "@store-sync-frontend",
                "@store-sync-frontend/*",
              ],
              message:
                "Storefront Next không import app Next khác — dùng `@workspace/*` hoặc `@ui`.",
            },
            {
              regex: `(?:${reAppsPath("backend")}|${reAppsPath("api")}|${reAppsPath("store-sync-frontend")})`,
              message:
                "Không import trực tiếp vào app khác trong monorepo — dùng `@/*`, `@workspace/*`, `@ui`.",
            },
            noFilePathToMonorepoPackages,
          ],
        },
      ],
    },
  },
];

/**
 * Admin Next (@backend): không kéo storefront hay stack server.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nextBackendServiceBoundary = [
  {
    name: "store-sync/boundary-next-backend",
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            nextForbiddenServerStack,
            {
              group: [
                "@frontend",
                "@frontend/*",
                "@store-sync-frontend",
                "@store-sync-frontend/*",
              ],
              message:
                "@backend không import storefront Next — hai nhóm app tách biệt.",
            },
            {
              regex: `(?:${reAppsPath("frontend")}|${reAppsPath("store-sync-frontend")}|${reAppsPath("api")})`,
              message:
                "Không import trực tiếp vào app khác — dùng `@/*`, `@workspace/*`, `@ui`.",
            },
            noFilePathToMonorepoPackages,
          ],
        },
      ],
    },
  },
];

/**
 * Package TS thuần (vd `@workspace/api-client`).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const sharedTsPackageBoundary = [
  {
    name: "store-sync/boundary-shared-ts-packages",
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@nestjs/*", "@mikro-orm/*"],
              message: "Package neutral không import Nest/MikroORM.",
            },
            {
              group: [
                "next",
                "next/*",
                "@next/*",
                "react",
                "react-dom",
                "react-dom/*",
              ],
              message:
                "Package TS dùng chung không import Next/React (tránh leak UI vào contract).",
            },
            {
              group: [
                "@frontend",
                "@frontend/*",
                "@backend",
                "@backend/*",
                "@ui",
                "@ui/*",
              ],
              message:
                "Package contract không import app Next hay @ui — chỉ type/logic trung lập.",
            },
            {
              regex: `(?:${reAppsPath("frontend")}|${reAppsPath("backend")}|${reAppsPath("api")})`,
              message:
                "Package không import vào apps/* — contract tách khỏi mã triển khai service.",
            },
            noFilePathToMonorepoPackages,
          ],
        },
      ],
    },
  },
];

/**
 * @ui — component library: không import server stack.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const reactUiPackageBoundary = [
  {
    name: "store-sync/boundary-ui",
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@nestjs/*", "@mikro-orm/*"],
              message: "@ui không import Nest/MikroORM — chỉ presentation.",
            },
            {
              group: [
                "@frontend",
                "@frontend/*",
                "@backend",
                "@backend/*",
              ],
              message:
                "@ui không import source app @frontend/@backend — component thuần, dùng chung qua workspace.",
            },
            {
              regex: `(?:${reAppsPath("frontend")}|${reAppsPath("backend")}|${reAppsPath("api")})`,
              message:
                "@ui không import vào apps/* — chỉ presentation, không phụ thuộc source từng service.",
            },
            noFilePathToMonorepoPackages,
          ],
        },
      ],
    },
  },
];
