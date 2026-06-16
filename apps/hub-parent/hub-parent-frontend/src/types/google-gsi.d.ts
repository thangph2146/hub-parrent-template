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

