import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * Checks whether a given userId is a member or admin of the configured channel.
 *
 * Telegram's getChatMember statuses:
 *  - 'creator'       → channel owner
 *  - 'administrator' → admin
 *  - 'member'        → regular subscriber
 *  - 'restricted'    → restricted member (still subscribed)
 *  - 'left'          → not subscribed
 *  - 'kicked'        → banned
 *
 * @param {import('telegraf').Telegraf} bot
 * @param {number} userId
 * @returns {Promise<boolean>}
 */
export async function isUserSubscribed(bot, userId) {
  try {
    const member = await bot.telegram.getChatMember(config.CHANNEL_ID, userId);
    const activeStatuses = ['creator', 'administrator', 'member', 'restricted'];
    return activeStatuses.includes(member.status);
  } catch (err) {
    // Telegram throws if the user has never interacted with the bot or the
    // channel is private and the user is not found. Treat as not-subscribed.
    logger.warn({ err, userId }, 'getChatMember failed; treating as not subscribed');
    return false;
  }
}
