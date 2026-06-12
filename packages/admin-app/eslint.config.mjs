import { config } from "@workspace/eslint-config/react-internal"
import { reactUiPackageBoundary } from "@workspace/eslint-config/service-boundaries"

export default [
  ...config,
  ...reactUiPackageBoundary,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_|^api$",
        },
      ],
    },
  },
]
