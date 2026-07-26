import { getAllChannels } from './channel.service.js';
import { JoinRequest } from '../models/join-request.model.js';
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
        // Agar a'zo bo'lmasa, so'rov yuborganlar ro'yxatidan tekshiramiz
        const hasRequested = await JoinRequest.exists({ userId, channelId: ch.channelId });
        if (!hasRequested) {
          notSubscribedTo.push(ch);
        }
      }
    } catch (err) {
      // getChatMember xatolik bersa (masalan, foydalanuvchi kanalga kirmagan bo'lsa),
      // baribir so'rov yuborganlar ro'yxatini tekshiramiz
      const hasRequested = await JoinRequest.exists({ userId, channelId: ch.channelId });
      if (!hasRequested) {
        logger.warn({ err: err.message, userId, channelId: ch.channelId }, 'Foydalanuvchi kanalga a\'zo emas va so\'rov ham yubormagan');
        notSubscribedTo.push(ch);
      }
    }
  }

  return {
    isSubscribed: notSubscribedTo.length === 0,
    channels
  };
}
