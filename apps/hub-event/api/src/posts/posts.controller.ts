/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Inject } from '@nestjs/common';
import { BasePostsController as PackagePostsController } from '@workspace/api-server/modules/posts';
import { PostsService } from './posts.service';

export class PostsController extends PackagePostsController {
  constructor(@Inject(PostsService) postsService: PostsService) {
    super(postsService);
  }
}
