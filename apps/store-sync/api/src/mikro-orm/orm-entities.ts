/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Account } from '../entities/account.entity';
import { Category } from '../entities/category.entity';
import { Notification } from '../entities/notification.entity';
import { Order } from '../entities/order.entity';
import { Post } from '../entities/post.entity';
import { PostCategory } from '../entities/post-category.entity';
import { Product } from '../entities/product.entity';
import { PromoCode } from '../entities/promo-code.entity';
import { Role } from '../entities/role.entity';
import { Session } from '../entities/session.entity';
import { SeoMeta } from '../entities/seo-meta.entity';
import { Setting } from '../entities/setting.entity';
import { StorageFile } from '../entities/storage-file.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { VerificationToken } from '../entities/verification-token.entity';

export const ormEntities = [
  Account,
  Category,
  Notification,
  Order,
  Post,
  PostCategory,
  Product,
  PromoCode,
  Role,
  Session,
  SeoMeta,
  Setting,
  StorageFile,
  User,
  UserRole,
  VerificationToken,
] as const;
