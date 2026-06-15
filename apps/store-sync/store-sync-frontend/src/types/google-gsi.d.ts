/**
 * GSI + Maps trên cùng `window.google` — store có `@react-google-maps/api`
 * nên cần merge type thủ công (check-in không có maps picker).
 */
declare global {
  interface Window {
    google?: {
      maps?: typeof google.maps
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential?: string }) => void | Promise<void>
          }) => void
          renderButton: (
            element: HTMLElement,
            config: Record<string, unknown>,
          ) => void
        }
      }
    }
  }
}

export {}
