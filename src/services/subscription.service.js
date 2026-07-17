import { getAllChannels } from './channel.service.js';
import { logger } from '../utils/logger.js';

/**
 * Foydalanuvchining barcha majburiy kanallarga a'zoligini tekshiradi.
 * @param {import('telegraf').Telegraf} bot
 * @param {number} userId
 * @returns {Promise<{ isSubscribed: boolean, channels: Array }>}
 */
export async function checkAllSubscriptions(bot, userId) {
  const channels = await getAllChannels();
  const notSubscribedTo = [];

  for (const ch of channels) {
    try {
      const member = await bot.telegram.getChatMember(ch.channelId, userId);
      const activeStatuses = ['creator', 'administrator', 'member', 'restricted'];
      if (!activeStatuses.includes(member.status)) {
        notSubscribedTo.push(ch);
      }
    } catch (err) {
      logger.warn({ err, userId, channelId: ch.channelId }, 'getChatMember failed; treating as not subscribed');
      notSubscribedTo.push(ch);
    }
  }

  return {
    isSubscribed: notSubscribedTo.length === 0,
    channels
  };
}
