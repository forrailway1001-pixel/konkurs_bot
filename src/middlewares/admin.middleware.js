import { config } from '../config/index.js';

/**
 * Middleware that allows only users whose ID is in ADMIN_IDS.
 * Silently ignores unauthorised requests (no error reply) to avoid
 * leaking that an admin command exists.
 */
export async function adminOnly(ctx, next) {
  const userId = ctx.from?.id?.toString();
  if (!userId || !config.ADMIN_IDS.includes(userId)) {
    return; // silently ignore
  }
  return next();
}
