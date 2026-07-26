import { Channel } from '../models/channel.model.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * Barcha kanallarni oladi.
 * Agar baza bo'sh bo'lsa, avtomatik ravishda .env dagi kanalni qaytaradi.
 */
export async function getAllChannels() {
  const channels = await Channel.find().lean();

  if (channels.length === 0 && config.CHANNEL_ID) {
    return [{ channelId: config.CHANNEL_ID }];
  }

  return channels;
}

/**
 * Berilgan qiymatdan Telegram'ning haqiqiy channelId'sini aniqlaydi.
 *
 * Qo'llab-quvvatlanadigan formatlar:
 *   @username
 *   -100xxxxxxxxxx  (numeric id)
 *   https://t.me/username
 *   https://t.me/+InviteHash   (yopiq kanal)
 *   https://t.me/joinchat/Hash (eski yopiq kanal havolasi)
 *
 * @param {import('telegraf').Telegram} telegram  — bot.telegram
 * @param {string} input
 * @returns {Promise<{ ok: true, channelId: string, title: string } | { ok: false, error: string }>}
 */
export async function resolveChannelId(telegram, input) {
  const raw = input.trim();

  // Invite link formatini aniqlash:
  // https://t.me/+xxx  yoki  https://t.me/joinchat/xxx
  const isInviteLink =
    /^https?:\/\/t\.me\/\+/i.test(raw) ||
    /^https?:\/\/t\.me\/joinchat//i.test(raw);

  if (isInviteLink) {
    // Yopiq kanal havolalari uchun getChatInviteLinkInfo ishlatiladi
    try {
      const info = await telegram.callApi('checkChatInviteLink', { invite_link: raw });
      // info.chat mavjud bo'lsa — bot allaqachon a'zo yoki kanal ochiq
      if (info?.chat?.id) {
        const id = String(info.chat.id);
        return { ok: true, channelId: id, title: info.chat.title ?? id };
      }
      // info.chat yo'q — bot hali kanalda admin emas, lekin linkdan title olish mumkin
      if (info?.title) {
        return {
          ok: false,
          error:
            `"${info.title}" kanali topildi, lekin bot u yerda admin emas.\n` +
            `Iltimos, botni kanalga admin qilib qo'shing va qayta urinib ko'ring.`,
        };
      }
      return { ok: false, error: 'Havola orqali kanal ma\'lumotini olishning imkoni bo\'lmadi.' };
    } catch (err) {
      logger.warn({ err, input: raw }, 'checkChatInviteLink xatolik');
      return {
        ok: false,
        error:
          'Yopiq kanal havolasi orqali kanalga kira olmadim.\n' +
          'Botni kanalga admin qilib qo\'shing va kanal ID'sini yoki @username'ini yuboring.',
      };
    }
  }

  // @username  yoki  https://t.me/username  yoki  -100xxx  formatlar
  let target = raw;

  // https://t.me/username → @username
  const publicLinkMatch = raw.match(/^https?:\/\/t\.me\/([A-Za-z0-9_]{5,})$/i);
  if (publicLinkMatch) {
    target = '@' + publicLinkMatch[1];
  }

  // numeric id — to'g'ridan to'g'ri
  if (/^-?\d+$/.test(target)) {
    target = Number(target);
  }

  try {
    const chat = await telegram.getChat(target);
    const channelId = String(chat.id);
    return { ok: true, channelId, title: chat.title ?? chat.username ?? channelId };
  } catch (err) {
    logger.warn({ err, input: raw }, 'getChat xatolik');
    return {
      ok: false,
      error:
        'Kanal topilmadi yoki bot u yerda admin emas.\n' +
        'Botni kanalga admin qilib qo\'shing va qayta urinib ko\'ring.',
    };
  }
}

/**
 * Kanal qo'shadi. Input ixtiyoriy formatda bo'lishi mumkin.
 *
 * @param {import('telegraf').Telegram} telegram
 * @param {string} input  — @username | id | link
 */
export async function addChannel(telegram, input) {
  const resolved = await resolveChannelId(telegram, input);
  if (!resolved.ok) {
    return { success: false, message: resolved.error };
  }

  const { channelId, title } = resolved;

  const existing = await Channel.findOne({ channelId });
  if (existing) {
    return { success: false, message: `Bu kanal allaqachon qo'shilgan (${title}).` };
  }

  await Channel.create({ channelId });
  return { success: true, channelId, title };
}

/**
 * Kanal o'chiradi. Input ixtiyoriy formatda bo'lishi mumkin.
 *
 * @param {import('telegraf').Telegram} telegram
 * @param {string} input
 */
export async function removeChannel(telegram, input) {
  const resolved = await resolveChannelId(telegram, input);
  if (!resolved.ok) {
    return { success: false, message: resolved.error };
  }

  const { channelId, title } = resolved;
  const result = await Channel.deleteOne({ channelId });
  if (result.deletedCount === 0) {
    return { success: false, message: `Kanal bazada topilmadi (${title}).` };
  }
  return { success: true, channelId, title };
}
