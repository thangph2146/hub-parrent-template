/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { PUBLIC_ROUTES } from '../config/constants';
import { appConfig } from '../config/app.config';

/** URL webhook đăng ký trên developers.hanet.ai. */
export function getHanetWebhookUrls(eventId?: string | number) {
  const base = (
    appConfig.publicUrl ?? `http://localhost:${appConfig.port}`
  ).replace(/\/+$/, '');
  const prefix = `${base}/api/${PUBLIC_ROUTES.HANET_WEBHOOK}`;

  return {
    auto: prefix,
    forEvent: eventId != null ? `${prefix}/${eventId}` : `${prefix}/{eventId}`,
    docs: {
      api: 'https://documenter.getpostman.com/view/13088306/TVeqcn2C',
      webhook: 'https://documenter.getpostman.com/view/13088306/TVmFmMEx',
      portal: 'https://developers.hanet.ai',
    },
  };
}
