# @workspace/query-client (packages/query-client)

Cấu hình TanStack Query dùng chung cho app Next (storefront `@frontend`, admin `@backend`, check-in frontend, …).

## Vị trí

- `packages/query-client/src/`
- Package namespace: `@workspace/query-client`

## Exports

### `createHubQueryClient(): QueryClient`

Factory function tạo `QueryClient` với default options. Dùng trong `QueryProvider` của mỗi app.

```ts
import { QueryClientProvider } from "@tanstack/react-query"
import { createHubQueryClient } from "@workspace/query-client"

const queryClient = createHubQueryClient()

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### `hubQueryClientDefaultOptions: DefaultOptions`

Object config dùng chung:

| Option                         | Value                  |
| ------------------------------ | ---------------------- |
| `queries.staleTime`            | 30s                    |
| `queries.gcTime`               | 10 phút                |
| `queries.retry`                | `hubDefaultQueryRetry` |
| `queries.refetchOnWindowFocus` | `false`                |
| `queries.refetchOnReconnect`   | `true`                 |
| `queries.refetchOnMount`       | `true`                 |
| `mutations.retry`              | `false`                |

### `hubDefaultQueryRetry(failureCount, error): boolean`

Retry logic: không retry lỗi 4xx (kiểm tra `status` duck-typing), retry tối đa 2 lần cho lỗi khác.

## Cách mở rộng

Nếu 1 app cần override default options, gọi `createHubQueryClient` và modify:

```ts
const client = createHubQueryClient()
client.setQueryDefaults(["my-key"], { staleTime: 60_000 })
```
