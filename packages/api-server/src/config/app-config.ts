/**
 * Runtime config tối thiểu cho controller admin (upload URL, …).
 * App Nest có thể override qua env giống hub-event.
 */
export const apiServerAppConfig = {
  get nodeEnv(): string {
    return process.env.NODE_ENV ?? 'development'
  },
  get publicUrl(): string | undefined {
    const v = process.env.PUBLIC_URL ?? process.env.NEXT_PUBLIC_APP_URL
    return v?.trim() || undefined
  },
}
