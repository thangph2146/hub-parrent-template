/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { ADMIN_ROUTES } from '../config/constants';
import { PERMISSIONS } from '../config/permissions';
import { Permissions } from '../common/permissions.decorator';
import { BasePostsController } from '../common/module-bases/posts/posts.controller';
import { PostsService } from './posts.service';

@Permissions(PERMISSIONS.POSTS_VIEW)
@Controller(ADMIN_ROUTES.POSTS)
export class PostsController extends BasePostsController {
  constructor(postsService: PostsService) {
    super(postsService);
  }
}
