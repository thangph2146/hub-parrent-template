/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Account } from '../entities/account.entity';
import { Camera } from '../entities/camera.entity';
import { Category } from '../entities/category.entity';
import { ContactRequest } from '../entities/contact-request.entity';
import { Event } from '../entities/event.entity';
import { EventCheckin } from '../entities/event-checkin.entity';
import { EventRegistration } from '../entities/event-registration.entity';
import { EventSpeaker } from '../entities/event-speaker.entity';
import { Notification } from '../entities/notification.entity';
import { PageContent } from '../entities/page-content.entity';
import { ParentStudent } from '../entities/parent-student.entity';
import { Post } from '../entities/post.entity';
import { PostCategory } from '../entities/post-category.entity';
import { PostTag } from '../entities/post-tag.entity';
import { Role } from '../entities/role.entity';
import { Session } from '../entities/session.entity';
import { SeoMeta } from '../entities/seo-meta.entity';
import { Setting } from '../entities/setting.entity';
import { Speaker } from '../entities/speaker.entity';
import { StorageFile } from '../entities/storage-file.entity';
import { Student } from '../entities/student.entity';
import { Tag } from '../entities/tag.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { VerificationToken } from '../entities/verification-token.entity';

export const ormEntities = [
  Account,
  Camera,
  Category,
  ContactRequest,
  Event,
  EventCheckin,
  EventRegistration,
  EventSpeaker,
  Notification,
  PageContent,
  ParentStudent,
  Post,
  PostCategory,
  PostTag,
  Role,
  Session,
  SeoMeta,
  Setting,
  Speaker,
  StorageFile,
  Student,
  Tag,
  User,
  UserRole,
  VerificationToken,
] as const;
