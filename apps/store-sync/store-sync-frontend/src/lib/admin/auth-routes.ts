import {

  STORE_ADMIN_HOME_PATH,

  STORE_ADMIN_LOGIN_PATH,

  STORE_ADMIN_REGISTER_PATH,

} from "@/config/admin/store-admin-access"



export { STORE_ADMIN_HOME_PATH, STORE_ADMIN_LOGIN_PATH }

export const AUTH_LOGIN_PATH = STORE_ADMIN_LOGIN_PATH

export const AUTH_REGISTER_PATH = STORE_ADMIN_REGISTER_PATH



const STORE_ADMIN_AUTH_PATHS = [

  STORE_ADMIN_LOGIN_PATH,

  AUTH_REGISTER_PATH,

] as const



const AUTH_SET = new Set<string>(STORE_ADMIN_AUTH_PATHS)



export function isStoreAdminAuthPath(

  pathname: string | null | undefined,

): boolean {

  if (!pathname) return false

  const normalized = pathname.replace(/\/+$/, "") || "/"

  return AUTH_SET.has(normalized)

}



export function getAdminAppHomeExternalPath(): string {

  return STORE_ADMIN_HOME_PATH

}



export function getAdminLoginExternalPath(): string {

  return STORE_ADMIN_LOGIN_PATH

}

