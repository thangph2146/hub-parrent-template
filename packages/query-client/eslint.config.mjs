import { config } from "@workspace/eslint-config/base";
import { sharedTsPackageBoundary } from "@workspace/eslint-config/service-boundaries";

/** Hook files cần `react` — ngoại lệ so với shared TS package boundary. */
const reactHookFiles = [
  "src/use-entity-draft-state.ts",
  "src/use-hydrate-once-per-entity.ts",
];

export default [
  ...config,
  ...sharedTsPackageBoundary,
  {
    files: reactHookFiles,
    rules: {
      "no-restricted-imports": "off",
    },
  },
];
