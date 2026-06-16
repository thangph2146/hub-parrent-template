import * as path from 'path';
import type { EntityManager } from '@mikro-orm/core';
import { Event, EventFormat } from '../entities/event.entity';
import {
  EventRegistration,
  RegistrationStatus,
} from '../entities/event-registration.entity';
import { User } from '../entities/user.entity';
import { Student } from '../entities/student.entity';
import { runSuperadminBootstrap } from './superadmin-bootstrap.runner';
import {
  loadExportPosts,
  type ExportPostSeedSource,
} from './load-export-posts';
import { resolveSeedExportPath } from '../common/data-paths';
import {
  isLexicalContentEmpty,
  isLexicalEditorState,
  lexicalFromPlainText,
} from './lexical-plain-text';

export type CheckinDemoSeedOptions = {
  postsExportPath?: string;
  eventCount?: number;
  randomSeed?: string;
  log?: (message: string) => void;
};

export type CheckinDemoSeedResult = {
  bootstrap: Awaited<ReturnType<typeof runSuperadminBootstrap>>;
  eventsCreated: number;
  eventsSkipped: number;
  eventsBackfilled: number;
  registrationsCreated: number;
};

const DEMO_LOCATIONS = [
  {
    location: 'Hội trường A — Trường ĐH Ngân hàng',
    address: '36 Tô Hiến Thành, Phường Bến Nghé, Quận 1, TP.HCM',
  },
  {
    location: 'Sảnh chính — Khu A',
    address: '56 Hoàng Diệu 2, Phường Linh Trung, TP. Thủ Đức, TP.HCM',
  },
  {
    location: 'Phòng hội thảo B201',
    address: 'Khuôn viên HUB — TP. Thủ Đức',
  },
  {
    location: 'Trực tuyến — Microsoft Teams',
    address: 'Online',
  },
] as const;

const ORGANIZER = 'Trường Đại học Ngân hàng TP. HCM';

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickInt(rand: () => number, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1));
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function addHours(base: Date, hours: number): Date {
  return new Date(base.getTime() + hours * 60 * 60 * 1000);
}

function eventSlugForPost(postSlug: string): string {
  const base = postSlug.replace(/^demo-/, '').slice(0, 72);
  return `demo-${base}`;
}

function buildDescription(post: ExportPostSeedSource): string {
  if (post.excerpt?.trim()) return post.excerpt.trim().slice(0, 500);
  return `Sự kiện demo được tạo từ bài viết «${post.title}» — phục vụ kiểm thử đăng ký và check-in HUB Events.`;
}

function resolveEventContent(post: ExportPostSeedSource): unknown {
  if (
    isLexicalEditorState(post.content) &&
    !isLexicalContentEmpty(post.content)
  ) {
    return post.content;
  }
  if (typeof post.content === 'string' && post.content.trim().startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(post.content);
      if (isLexicalEditorState(parsed) && !isLexicalContentEmpty(parsed)) {
        return parsed;
      }
    } catch {
      // fallback plain text
    }
  }
  return lexicalFromPlainText(buildDescription(post));
}

function resolveDefaultExportPath(log?: (message: string) => void): string {
  const fromEnv = process.env.CHECKIN_DEMO_POSTS_EXPORT?.trim();
  if (fromEnv) {
    try {
      return resolveSeedExportPath({ explicitPath: fromEnv });
    } catch {
      log?.(
        `CHECKIN_DEMO_POSTS_EXPORT không tồn tại (${fromEnv}), thử data/seed/.`,
      );
    }
  }

  return resolveSeedExportPath({ legacyDir: path.join(__dirname, '..') });
}

async function applyDemoEventContent(
  em: EntityManager,
  event: Event,
  post: ExportPostSeedSource,
): Promise<boolean> {
  if (!isLexicalContentEmpty(event.content)) return false;
  event.content = resolveEventContent(post);
  em.persist(event);
  return true;
}

async function createDemoEvent(
  em: EntityManager,
  post: ExportPostSeedSource,
  rand: () => number,
  createdBy: User | null,
  featuredOrder: number | null,
): Promise<'created' | 'skipped' | 'backfilled'> {
  const slug = eventSlugForPost(post.slug);
  const exists = await em.findOne(Event, { slug });
  if (exists) {
    const backfilled = await applyDemoEventContent(em, exists, post);
    return backfilled ? 'backfilled' : 'skipped';
  }

  const now = new Date();
  const dayOffset = pickInt(rand, -21, 45);
  const startHour = pickInt(rand, 8, 17);
  const durationHours = pickInt(rand, 2, 6);

  const startDate = addDays(now, dayOffset);
  startDate.setHours(startHour, 0, 0, 0);
  const endDate = addHours(startDate, durationHours);

  const registrationStart = addDays(startDate, -14);
  const registrationEnd = new Date(startDate);
  const checkinStart = addHours(startDate, -1);
  const checkinEnd = addHours(startDate, 2);
  const checkoutStart = new Date(endDate);
  const checkoutEnd = addHours(endDate, 1);

  const loc = DEMO_LOCATIONS[pickInt(rand, 0, DEMO_LOCATIONS.length - 1)];
  const formatRoll = rand();
  const format =
    formatRoll < 0.15
      ? EventFormat.ONLINE
      : formatRoll < 0.25
        ? EventFormat.HYBRID
        : EventFormat.OFFLINE;

  const event = new Event();
  event.title =
    post.title.length > 180 ? `${post.title.slice(0, 177)}…` : post.title;
  event.slug = slug;
  event.description = buildDescription(post);
  event.content = resolveEventContent(post);
  event.poster = post.image ? { url: post.image } : null;
  event.startDate = startDate;
  event.endDate = endDate;
  event.registrationStart = registrationStart;
  event.registrationEnd = registrationEnd;
  event.checkinStart = checkinStart;
  event.checkinEnd = checkinEnd;
  event.checkoutStart = checkoutStart;
  event.checkoutEnd = checkoutEnd;
  event.organizer = ORGANIZER;
  event.location = loc.location;
  event.address = loc.address;
  event.status = 1;
  event.allowCheckin = true;
  event.allowCheckout = true;
  event.requireFaceId = false;
  event.maxParticipants = pickInt(rand, 80, 400);
  event.format = format;
  event.onlineLink =
    format === EventFormat.OFFLINE
      ? null
      : 'https://teams.microsoft.com/l/meetup-join/demo';
  event.isFeatured = featuredOrder != null;
  event.featuredOrder = featuredOrder ?? 0;
  event.createdBy = createdBy;

  em.persist(event);
  return 'created';
}

async function seedDemoRegistrations(
  em: EntityManager,
  rand: () => number,
  log: (message: string) => void,
): Promise<number> {
  const now = new Date();
  const events = await em.find(
    Event,
    {
      slug: { $like: 'demo-%' },
      deletedAt: null,
      startDate: { $gte: addDays(now, -3) },
    },
    { orderBy: { startDate: 'ASC' }, limit: 8 },
  );

  const registrants = [
    { email: 'demo.sv@st.buh.edu.vn', fullName: 'Sinh viên demo (check-in)' },
    { email: 'demo.khach@hub.edu.vn', fullName: 'Khách demo (check-in)' },
    { email: 'student@hub.edu.vn', fullName: 'Nguyễn Văn A' },
  ];

  let created = 0;
  for (const event of events) {
    const subset = shuffle(registrants, rand).slice(0, pickInt(rand, 1, 3));
    for (const person of subset) {
      const exists = await em.findOne(EventRegistration, {
        event: event.id,
        email: person.email,
      });
      if (exists) continue;

      const reg = new EventRegistration();
      reg.event = event;
      reg.email = person.email;
      reg.fullName = person.fullName;
      reg.phone = '0900000000';
      reg.registeredAt = addDays(now, -pickInt(rand, 1, 10));
      reg.status = RegistrationStatus.CONFIRMED;
      em.persist(reg);
      created += 1;
    }
    event.totalRegistrations = await em.count(EventRegistration, {
      event: event.id,
      deletedAt: null,
    });
    em.persist(event);
  }

  if (created > 0) {
    await em.flush();
    log(`Created ${created} demo event registration(s).`);
  }
  return created;
}

const DEMO_STUDENT_RECORDS = [
  {
    email: 'demo.sv@st.buh.edu.vn',
    studentCode: '202600001',
    name: 'Sinh viên demo (check-in)',
  },
  {
    email: 'student@hub.edu.vn',
    studentCode: '202400001',
    name: 'Nguyễn Văn A',
  },
] as const;

async function seedDemoStudentRecords(
  em: EntityManager,
  log: (message: string) => void,
): Promise<number> {
  let upserted = 0;
  for (const row of DEMO_STUDENT_RECORDS) {
    const user = await em.findOne(User, {
      email: row.email.trim().toLowerCase(),
      deletedAt: null,
    });
    if (!user) continue;

    let student = await em.findOne(Student, {
      user: user.id,
      deletedAt: null,
    });
    if (!student) {
      student = new Student();
      student.user = user;
      student.isActive = true;
      em.persist(student);
    }
    student.studentCode = row.studentCode;
    student.name = row.name;
    student.email = row.email;
    upserted += 1;
  }

  if (upserted > 0) {
    await em.flush();
    log(`Linked ${upserted} demo student record(s) with numeric MSSV.`);
  }
  return upserted;
}

/**
 * Seed demo check-in: tài khoản dev (`superadmin-bootstrap`) + sự kiện ngẫu nhiên từ bài viết export.
 * Idempotent theo slug `demo-*`.
 */
export async function runCheckinDemoSeed(
  em: EntityManager,
  options: CheckinDemoSeedOptions = {},
): Promise<CheckinDemoSeedResult> {
  const log = options.log ?? (() => undefined);
  const exportPath = options.postsExportPath ?? resolveDefaultExportPath(log);
  const rawCount =
    options.eventCount ?? Number(process.env.CHECKIN_DEMO_EVENT_COUNT ?? '15');
  const eventCount = Math.max(
    1,
    Math.min(40, Number.isFinite(rawCount) ? rawCount : 15),
  );
  const rand = mulberry32(
    hashSeed(
      options.randomSeed ?? process.env.CHECKIN_DEMO_SEED ?? 'hub-checkin-demo',
    ),
  );

  log('=== Check-in demo seed ===');
  log(`Posts export: ${exportPath}`);
  log(`Target events: ${eventCount}`);

  const bootstrap = await runSuperadminBootstrap(em, log);
  await seedDemoStudentRecords(em, log);

  const posts = loadExportPosts(exportPath);
  if (!posts.length) {
    throw new Error('Export không có bài viết published để tạo sự kiện demo.');
  }

  const picked = shuffle(posts, rand).slice(0, eventCount);
  const createdBy =
    (await em.findOne(User, { email: 'btc.checkin@hub.edu.vn' })) ??
    (await em.findOne(User, { email: 'superadmin@hub.edu.vn' }));

  let eventsCreated = 0;
  let eventsSkipped = 0;
  let eventsBackfilled = 0;
  let featured = 0;

  for (const post of picked) {
    const featuredOrder = featured < 3 ? featured : null;
    const result = await createDemoEvent(
      em,
      post,
      rand,
      createdBy,
      featuredOrder,
    );
    if (result === 'created') {
      eventsCreated += 1;
      if (featuredOrder != null) featured += 1;
      log(`Event: ${post.title.slice(0, 60)}…`);
    } else if (result === 'backfilled') {
      eventsBackfilled += 1;
      log(`Bổ sung nội dung: demo-${post.slug}`);
    } else {
      eventsSkipped += 1;
      log(`Skip (đã có): demo-${post.slug}`);
    }
  }

  await em.flush();

  const registrationsCreated = await seedDemoRegistrations(em, rand, log);

  log('=== Tài khoản test (mật khẩu: demo) ===');
  log('Quản trị: superadmin@hub.edu.vn | btc.checkin@hub.edu.vn');
  log('Sinh viên: demo.sv@st.buh.edu.vn | student@hub.edu.vn');
  log('Khách: demo.khach@hub.edu.vn');
  log(
    `Done — events +${eventsCreated}, backfill ${eventsBackfilled}, skip ${eventsSkipped}, registrations +${registrationsCreated}`,
  );

  return {
    bootstrap,
    eventsCreated,
    eventsSkipped,
    eventsBackfilled,
    registrationsCreated,
  };
}
