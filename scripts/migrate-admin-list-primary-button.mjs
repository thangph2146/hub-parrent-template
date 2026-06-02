import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const files = [
  "apps/backend/src/app/academic-years/page.tsx",
  "apps/backend/src/app/categories/page.tsx",
  "apps/backend/src/app/courses/page.tsx",
  "apps/backend/src/app/departments/page.tsx",
  "apps/backend/src/app/locations/page.tsx",
  "apps/backend/src/app/seo-metas/page.tsx",
  "apps/backend/src/app/speakers/page.tsx",
  "apps/backend/src/app/tags/page.tsx",
  "apps/backend/src/app/training-levels/page.tsx",
  "apps/backend/src/app/training-systems/page.tsx",
]

for (const rel of files) {
  const file = path.join(root, rel)
  let src = fs.readFileSync(file, "utf8")
  if (src.includes("AdminPageHeaderPrimaryButton")) {
    console.log("skip", rel)
    continue
  }
  if (!src.includes("AdminListPageHeader")) continue

  src = src.replace(
    /import \{([^}]+)\} from "@ui\/components\/admin"/,
    (_, inner) => {
      if (inner.includes("AdminPageHeaderPrimaryButton")) return `import {${inner}} from "@ui/components/admin"`
      return `import { ${inner.trim()}, AdminPageHeaderPrimaryButton } from "@ui/components/admin"`
    }
  )

  src = src.replace(
    /<Button(\s+type="button"\s+onClick=\{\(\) => router\.push\("[^"]+"\)\}[^>]*)>([\s\S]*?)<\/Button>/g,
    "<AdminPageHeaderPrimaryButton$1>$2</AdminPageHeaderPrimaryButton>"
  )

  fs.writeFileSync(file, src)
  console.log("ok", rel)
}
