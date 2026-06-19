import { NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import type { GraphData, ContextData } from "@ui/lib/graphify-context"

const emptyGraph: GraphData = {
  directed: true,
  multigraph: false,
  graph: { community_labels: {} },
  nodes: [],
  links: [],
}

const emptyContext: ContextData = {
  generatedAt: new Date(0).toISOString(),
  projectRoot: process.cwd(),
  summary: {
    totalFiles: 0,
    clientComponents: 0,
    pages: [],
    layouts: [],
    apiRoutes: [],
  },
  files: {},
}

async function readSnapshotJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(
      join(process.cwd(), ".graphify", "snapshot", fileName),
      "utf8",
    )
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export async function GET() {
  try {
    const [graph, context] = await Promise.all([
      readSnapshotJson<GraphData>("graph.json", emptyGraph),
      readSnapshotJson<ContextData>("context.json", emptyContext),
    ])
    const payload = {
      graph,
      context,
    }
    return NextResponse.json(payload)
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Failed to load graphify data",
      },
      { status: 500 }
    )
  }
}
