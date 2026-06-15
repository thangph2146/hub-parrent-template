import {
  canCancelMyRegistration,
  type MyRegisteredEvent,
} from "../_lib/my-registered-events"

export function eventHref(
  row: MyRegisteredEvent,
  eventDetailPathPrefix = "/su-kien",
): string {
  const prefix = eventDetailPathPrefix.replace(/\/+$/, "")
  return `${prefix}/${row.event.slug ?? row.event.id}`
}

export function canCancelRegistrationRow(row: MyRegisteredEvent): boolean {
  return canCancelMyRegistration(row)
}
