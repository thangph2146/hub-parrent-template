import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import { toEntityId } from '../common';
import { EventRegistration } from '../entities/event-registration.entity';
import { FaceData } from '../entities/face-data.entity';
import { HANET_PERSON_ID_KEYS, pickHanetString } from './hanet-payload';
import type { HanetWebhookBody } from './hanet.types';

function readFormDataHanetPersonId(formData: unknown): string {
  if (!formData || typeof formData !== 'object' || Array.isArray(formData)) {
    return '';
  }
  const value = (formData as Record<string, unknown>).hanetPersonId;
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

/** Gắn hanetPersonId vào formData các đăng ký khớp email (alias HANET). */
export async function linkHanetPersonToRegistrationsByEmail(
  em: EntityManager,
  personId: string,
  email: string,
): Promise<number> {
  const normalized = email.trim().toLowerCase();
  if (!personId || !normalized.includes('@')) return 0;

  const registrations = await em.find(EventRegistration, {
    email: normalized,
    deletedAt: null,
  } as FilterQuery<EventRegistration>);

  let linked = 0;
  for (const reg of registrations) {
    const current = readFormDataHanetPersonId(reg.formData);
    if (current === personId) continue;

    const base =
      reg.formData && typeof reg.formData === 'object' && !Array.isArray(reg.formData)
        ? (reg.formData as Record<string, unknown>)
        : {};

    reg.formData = { ...base, hanetPersonId: personId };
    linked += 1;
  }

  if (linked > 0) await em.flush();
  return linked;
}

export async function findEventRegistrationForHanet(
  em: EntityManager,
  eventId: string,
  body: HanetWebhookBody,
  email: string,
  fullName: string,
): Promise<EventRegistration | null> {
  const byEmail = await em.findOne(EventRegistration, {
    event: toEntityId(eventId),
    email,
    deletedAt: null,
  } as FilterQuery<EventRegistration>);
  if (byEmail) return byEmail;

  if (fullName) {
    const byName = await em.findOne(EventRegistration, {
      event: toEntityId(eventId),
      fullName,
      deletedAt: null,
    } as FilterQuery<EventRegistration>);
    if (byName) return byName;
  }

  const personId = pickHanetString(body, HANET_PERSON_ID_KEYS);
  if (!personId) return null;

  const face = await em.findOne(
    FaceData,
    { hanetPersonId: personId, deletedAt: null } as FilterQuery<FaceData>,
    { populate: ['user'] },
  );

  if (face?.user?.email) {
    const byFaceUser = await em.findOne(EventRegistration, {
      event: toEntityId(eventId),
      email: face.user.email,
      deletedAt: null,
    } as FilterQuery<EventRegistration>);
    if (byFaceUser) return byFaceUser;
  }

  if (face?.displayName && fullName && face.displayName === fullName) {
    const byFaceName = await em.findOne(EventRegistration, {
      event: toEntityId(eventId),
      fullName: face.displayName,
      deletedAt: null,
    } as FilterQuery<EventRegistration>);
    if (byFaceName) return byFaceName;
  }

  const eventRegs = await em.find(EventRegistration, {
    event: toEntityId(eventId),
    deletedAt: null,
  } as FilterQuery<EventRegistration>);

  for (const reg of eventRegs) {
    if (readFormDataHanetPersonId(reg.formData) === personId) return reg;
  }

  const aliasEmail = pickHanetString(body, ['aliasID', 'aliasId']);
  if (aliasEmail.includes('@')) {
    return em.findOne(EventRegistration, {
      event: toEntityId(eventId),
      email: aliasEmail.toLowerCase(),
      deletedAt: null,
    } as FilterQuery<EventRegistration>);
  }

  return null;
}
