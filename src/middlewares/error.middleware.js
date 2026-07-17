import { logger } from '../utils/logger.js';

/**
 * Global error-handling middleware.
 * Logs the full error and sends a friendly message to the user.
 *
 * @param {Error} err
 * @param {import('telegraf').Context} ctx
 */
export function errorHandler(err, ctx) {
  logger.error(
    { err, update: ctx.update },
    'Unhandled error in update handler'
  );

  ctx
    .reply('⚠️ An unexpected error occurred. Please try again later.')
    .catch(() => {
      // Swallow errors that occur while trying to send the error reply itself
    });
}
