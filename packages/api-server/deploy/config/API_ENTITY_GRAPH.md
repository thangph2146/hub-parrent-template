# API — entity graph (MikroORM closure)

> **Sinh tự động:** `2026-06-14T11:12:04.381Z` từ `apps/main/api`.
> **Mục đích:** partial render / prune entity **bắt buộc** dùng closure từ manifest này — không cắt entity thủ công.

## Chính sách render

| Chế độ | Entities | Migrations |
|--------|----------|------------|
| **Mặc định (khuyến nghị)** | Copy **full** `src/entities/` | Copy full |
| `--prune-entities` (thử nghiệm) | Closure từ graph module + quan hệ | Vẫn full (schema thống nhất) |

Module closure (`resolve-module-closure`) và entity closure (`resolve-entity-closure`) là **hai lớp độc lập** — graphify/API_DOMAIN_IMPORTS cho module; manifest này cho entity.

## Tổng quan (46 entity)

| Entity | File | Quan hệ (class) |
|--------|------|-----------------|
| `AcademicYear` | `academic-year.entity.ts` | — |
| `Account` | `account.entity.ts` | `User` |
| `AdmissionResult` | `admission-result.entity.ts` | — |
| `Camera` | `camera.entity.ts` | `Event` |
| `Category` | `category.entity.ts` | `Category`, `PostCategory` |
| `Comment` | `comment.entity.ts` | `Post`, `User` |
| `ContactRequest` | `contact-request.entity.ts` | `User` |
| `Course` | `course.entity.ts` | — |
| `CustomerCart` | `customer-cart.entity.ts` | — |
| `Department` | `department.entity.ts` | — |
| `Event` | `event.entity.ts` | `Camera`, `EventCheckin`, `EventRegistration`, `EventSpeaker`, `User` |
| `EventCheckin` | `event-checkin.entity.ts` | `Event`, `EventRegistration` |
| `EventRegistration` | `event-registration.entity.ts` | `Event` |
| `EventSpeaker` | `event-speaker.entity.ts` | `Event`, `Speaker` |
| `FaceData` | `face-data.entity.ts` | `User` |
| `Group` | `group.entity.ts` | `GroupMember`, `Message`, `User` |
| `GroupMember` | `group-member.entity.ts` | `Group`, `User` |
| `ImportedUser` | `imported-user.entity.ts` | `AcademicYear`, `Major`, `TrainingLevel`, `TrainingSystem` |
| `Location` | `location.entity.ts` | — |
| `Major` | `major.entity.ts` | — |
| `Message` | `message.entity.ts` | `Group`, `Message`, `MessageRead`, `User` |
| `MessageRead` | `message-read.entity.ts` | `Message`, `User` |
| `Notification` | `notification.entity.ts` | `User` |
| `Order` | `order.entity.ts` | `User` |
| `PageContent` | `page-content.entity.ts` | — |
| `ParentStudent` | `parent-student.entity.ts` | `User` |
| `Post` | `post.entity.ts` | `Comment`, `PostCategory`, `PostTag`, `User` |
| `PostCategory` | `post-category.entity.ts` | `Category`, `Post` |
| `PostTag` | `post-tag.entity.ts` | `Post`, `Tag` |
| `Product` | `product.entity.ts` | — |
| `PromoCode` | `promo-code.entity.ts` | — |
| `Role` | `role.entity.ts` | `UserRole` |
| `Screen` | `screen.entity.ts` | `Camera`, `Template` |
| `SeoMeta` | `seo-meta.entity.ts` | — |
| `Session` | `session.entity.ts` | `User` |
| `Setting` | `setting.entity.ts` | — |
| `Speaker` | `speaker.entity.ts` | — |
| `StorageFile` | `storage-file.entity.ts` | `User` |
| `Student` | `student.entity.ts` | `User` |
| `Tag` | `tag.entity.ts` | `PostTag` |
| `Template` | `template.entity.ts` | — |
| `TrainingLevel` | `training-level.entity.ts` | — |
| `TrainingSystem` | `training-system.entity.ts` | — |
| `User` | `user.entity.ts` | `Account`, `Comment`, `Group`, `GroupMember`, `Message`, `MessageRead`, `Notification`, `Post`, `Session`, `Student`, `UserRole` |
| `UserRole` | `user-role.entity.ts` | `Role`, `User` |
| `VerificationToken` | `verification-token.entity.ts` | — |

## Module → entity (import trong domain)

| Module | Entity classes |
|--------|----------------|
| `academic-years` | `AcademicYear` |
| `accounts` | `User`, `UserRole` |
| `admission-results` | `AdmissionResult` |
| `auth` | `Role`, `Setting`, `User`, `UserRole` |
| `cameras` | `Camera` |
| `carts` | — |
| `categories` | `Category`, `PostCategory` |
| `comments` | `Comment` |
| `config` | — |
| `contact-requests` | `ContactRequest` |
| `courses` | `Course` |
| `dashboard` | `Category`, `PostCategory` |
| `departments` | `Department` |
| `event-checkins` | `EventCheckin`, `EventRegistration` |
| `event-checkouts` | — |
| `event-registrations` | `Event`, `EventRegistration`, `User` |
| `event-speakers` | `EventSpeaker` |
| `events` | `Camera`, `Event` |
| `face-data` | `FaceData` |
| `groups` | `Group`, `GroupMember`, `Message`, `MessageRead`, `User` |
| `hanet` | `Camera`, `Event`, `EventRegistration` |
| `imported-users` | `ImportedUser` |
| `locations` | `Location` |
| `majors` | `Major` |
| `messages` | `Group`, `GroupMember`, `Message`, `MessageRead`, `User` |
| `migrations` | — |
| `mikro-orm` | `AcademicYear`, `Account`, `AdmissionResult`, `Camera`, `Category`, `Comment`, `ContactRequest`, `Course`, `CustomerCart`, `Department`, `Event`, `EventCheckin`, `EventRegistration`, `EventSpeaker`, `FaceData`, `Group`, `GroupMember`, `ImportedUser`, `Location`, `Major`, `Message`, `MessageRead`, `Notification`, `Order`, `PageContent`, `ParentStudent`, `Post`, `PostCategory`, `PostTag`, `Product`, `PromoCode`, `Role`, `Screen`, `SeoMeta`, `Session`, `Setting`, `Speaker`, `StorageFile`, `Student`, `Tag`, `Template`, `TrainingLevel`, `TrainingSystem`, `User`, `UserRole`, `VerificationToken` |
| `notifications` | `ContactRequest`, `Message`, `Notification`, `User`, `UserRole` |
| `orders` | `Order`, `Product`, `User` |
| `page-contents` | `PageContent` |
| `parent-students` | `ParentStudent`, `User` |
| `posts` | `Post`, `PostCategory`, `PostTag`, `User` |
| `products` | `Product` |
| `promo-codes` | `PromoCode` |
| `proxy-image` | — |
| `public` | `Category`, `ContactRequest`, `Event`, `EventRegistration`, `Post`, `Role`, `Setting`, `Tag`, `User` |
| `roles` | `Role`, `User` |
| `screens` | `Screen` |
| `scripts` | — |
| `seeders` | — |
| `seeds` | `Event`, `EventRegistration`, `Order`, `PageContent`, `Product`, `PromoCode`, `Role`, `User`, `UserRole` |
| `seo-metas` | `SeoMeta` |
| `sessions` | `Role`, `Session`, `User`, `UserRole` |
| `settings` | `Setting` |
| `socket` | `Notification`, `User` |
| `speakers` | `Speaker` |
| `students` | `User` |
| `system` | — |
| `tags` | `Tag` |
| `templates` | `Template` |
| `training-levels` | `TrainingLevel` |
| `training-systems` | `TrainingSystem` |
| `uploads` | `StorageFile`, `User` |
| `users` | `Role`, `Setting`, `User`, `UserRole` |

## Làm mới

```bash
pnpm api:sync-template
pnpm verify:entity-closure
```
