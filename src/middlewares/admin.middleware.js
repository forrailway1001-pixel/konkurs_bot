import { config } from '../config/index.js';

/**
 * Middleware that allows only users whose ID is in ADMIN_IDS.
 * Silently ignores unauthorised requests (no error reply) to avoid
 * leaking that an admin command exists.
 */
export async function adminOnly(ctx, next) {
  const userId = String(ctx.from?.id);
  if (!config.ADMIN_IDS.includes(userId)) {
    logger.warn({ userId }, 'Unauthorized access attempt');
    return;
  }
  return next();
}

export async function superAdminOnly(ctx, next) {
  const userId = String(ctx.from?.id);
  if (userId !== config.SUPER_ADMIN) {
    logger.warn({ userId }, 'Unauthorized access attempt to super admin command');
    return;
  }
  return next();
}
