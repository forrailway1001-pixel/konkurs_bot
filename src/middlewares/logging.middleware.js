import { logger } from '../utils/logger.js';

/**
 * Logs every incoming update with user identity information.
 */
export async function loggingMiddleware(ctx, next) {
  const user = ctx.from;
  const updateType = ctx.updateType;

  logger.info(
    {
      updateType,
      userId: user?.id,
      username: user?.username,
      firstName: user?.first_name,
    },
    'Incoming update'
  );

  return next();
}
