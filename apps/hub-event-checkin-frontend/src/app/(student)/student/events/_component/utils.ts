import {
  canCancelMyRegistration,
  type MyRegisteredEvent,
} from "@/lib/my-registered-events"

export function eventHref(row: MyRegisteredEvent): string {
  return `/su-kien/${row.event.slug ?? row.event.id}`
}

export function canCancelRegistrationRow(row: MyRegisteredEvent): boolean {
  return canCancelMyRegistration(row)
}
