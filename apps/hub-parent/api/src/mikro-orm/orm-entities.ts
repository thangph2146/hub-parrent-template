import { Account } from '../entities/account.entity';
import { Category } from '../entities/category.entity';
import { ContactRequest } from '../entities/contact-request.entity';
import { Notification } from '../entities/notification.entity';
import { ParentStudent } from '../entities/parent-student.entity';
import { Post } from '../entities/post.entity';
import { PostCategory } from '../entities/post-category.entity';
import { PostTag } from '../entities/post-tag.entity';
import { Role } from '../entities/role.entity';
import { Session } from '../entities/session.entity';
import { SeoMeta } from '../entities/seo-meta.entity';
import { Setting } from '../entities/setting.entity';
import { StorageFile } from '../entities/storage-file.entity';
import { Student } from '../entities/student.entity';
import { Tag } from '../entities/tag.entity';
import { Template } from '../entities/template.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { VerificationToken } from '../entities/verification-token.entity';

export const ormEntities = [
  Account,
  Category,
  ContactRequest,
  Notification,
  ParentStudent,
  Post,
  PostCategory,
  PostTag,
  Role,
  Session,
  SeoMeta,
  Setting,
  StorageFile,
  Student,
  Tag,
  Template,
  User,
  UserRole,
  VerificationToken,
] as const;
