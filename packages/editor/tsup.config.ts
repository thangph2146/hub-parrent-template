import { defineConfig } from "tsup"
import { sassPlugin } from "esbuild-sass-plugin"

const isWatch = process.argv.includes("--watch")

export default defineConfig({
  entry: ["src/index.ts", "src/editor-x/editor.tsx"],
  format: ["cjs", "esm"],
  dts: true,
  // clean khi watch → xóa dist liên tục, kích hoạt vòng reload Next (2 app dev)
  clean: !isWatch,
  external: ["react", "react-dom", "lexical", "@lexical/react", "next"],
  treeshake: true,
  splitting: true,
  silent: true,
  esbuildPlugins: [sassPlugin()],
})
