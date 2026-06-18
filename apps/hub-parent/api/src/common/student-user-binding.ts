import type { EntityManager } from '@mikro-orm/core';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import { toEntityId } from './entity-id';
import {
  normalizeNumericStudentCode,
  studentCodeFromSchoolEmail,
} from './student-code-resolve';

export async function resolveStudentCodeForUser(
  em: EntityManager,
  userId: string,
  email: string,
): Promise<string | null> {
  const student = await em.findOne(Student, {
    user: toEntityId(userId),
    deletedAt: null,
  });
  const fromDb = normalizeNumericStudentCode(student?.studentCode);
  if (fromDb) return fromDb;
  return studentCodeFromSchoolEmail(email);
}

export async function upsertStudentCodeForUser(
  em: EntityManager,
  userId: string,
  rawCode: string,
  name: string | null,
  email: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const trimmed = rawCode?.trim() ?? '';
  if (!trimmed) {
    const existing = await em.findOne(Student, {
      user: toEntityId(userId),
      deletedAt: null,
    });
    if (existing) {
      existing.deletedAt = new Date();
      await em.flush();
    }
    return { ok: true };
  }

  const code = normalizeNumericStudentCode(trimmed);
  if (!code) {
    return {
      ok: false,
      message: 'Mã số sinh viên phải là số (5–12 chữ số).',
    };
  }

  const taken = await em.findOne(
    Student,
    { studentCode: code, deletedAt: null },
    { populate: ['user'] },
  );
  if (taken && String(taken.user?.id) !== String(toEntityId(userId))) {
    return {
      ok: false,
      message: 'Mã số sinh viên đã được liên kết với tài khoản khác.',
    };
  }

  let student = await em.findOne(Student, {
    user: toEntityId(userId),
    deletedAt: null,
  });

  if (!student) {
    student = new Student();
    student.studentCode = code;
    student.name = name?.trim() || null;
    student.email = email.trim();
    student.user = em.getReference(User, toEntityId(userId));
    student.isActive = true;
    em.persist(student);
  } else {
    student.studentCode = code;
    if (name?.trim()) student.name = name.trim();
    if (email.trim()) student.email = email.trim();
  }

  await em.flush();
  return { ok: true };
}
