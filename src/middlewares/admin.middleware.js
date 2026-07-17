import { config } from '../config/index.js';
import { isAdmin } from '../services/admin.service.js';
import { logger } from '../utils/logger.js';

/**
 * Faqat adminlarga ruxsat beradi.
 * Adminlar = SUPER_ADMIN + .env ADMIN_IDS + DB dagi dinamik adminlar.
 */
export async function adminOnly(ctx, next) {
  const userId = ctx.from?.id;
  if (!userId) return;

  const ok = await isAdmin(userId);
  if (!ok) {
    logger.warn({ userId }, 'Unauthorized admin access attempt');
    return;
  }
  return next();
}

/**
 * Faqat SUPER_ADMIN ga ruxsat beradi.
 */
export async function superAdminOnly(ctx, next) {
  const userId = String(ctx.from?.id);
  if (userId !== config.SUPER_ADMIN) {
    logger.warn({ userId }, 'Unauthorized super-admin access attempt');
    return;
  }
  return next();
}
