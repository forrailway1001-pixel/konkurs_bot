import { Channel } from "../models/channel.model.js";
import { logger } from "../utils/logger.js";

/**
 * Barcha kanallarni oladi.
 */
export async function getAllChannels() {
  return Channel.find().lean();
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

  // Invite link formatlari
  const isInviteLink =
    /^https?:\/\/t\.me\/\+/i.test(raw) ||
    /^https?:\/\/t\.me\/joinchat\//i.test(raw);

  // @username  yoki  https://t.me/username  yoki  -100xxx  formatlar
  let target = raw;

  if (!isInviteLink) {
    // https://t.me/username → @username
    const publicLinkMatch = raw.match(/^https?:\/\/t\.me\/([A-Za-z0-9_]{5,})$/i);
    if (publicLinkMatch) {
      target = '@' + publicLinkMatch[1];
    }

    // numeric id — to'g'ridan to'g'ri raqamga o'girish
    if (/^-?\d+$/.test(target)) {
      target = Number(target);
    }
  }

  try {
    const chat = await telegram.getChat(target);
    const channelId = String(chat.id);
    
    // Kanalga kirish havolasini avtomatik olish
    let inviteLink = null;
    if (chat.username) {
      inviteLink = `https://t.me/${chat.username}`;
    } else {
      // Yopiq kanal bo'lsa, "Qo'shilish so'rovi" (Join Request) talab qiluvchi havola yaratamiz
      try {
        const invite = await telegram.createChatInviteLink(channelId, {
          name: 'Konkurs Bot Havolasi',
          creates_join_request: true,
        });
        inviteLink = invite.invite_link;
      } catch (e) {
        logger.warn({ err: e, channelId }, 'Invite link yaratishda xatolik');
      }
    }

    return { ok: true, channelId, title: chat.title ?? chat.username ?? channelId, inviteLink };
  } catch (err) {
    logger.warn({ err, input: raw }, 'getChat xatolik');

    if (isInviteLink) {
      return {
        ok: false,
        error:
          'Yopiq kanal invite havolasi orqali kanal IDsini aniqlash imkoni bo\'lmadi.\n\n' +
          '📋 <b>Qanday qilish kerak:</b>\n' +
          '1. Botni kanalga <b>admin</b> qilib qo\'shing\n' +
          '2. Kanaldan istalgan xabarni <code>@JsonDumpBot</code> ga <b>forward</b> qiling\n' +
          '3. <code>forward_from_chat.id</code> qiymatini (masalan <code>-1001234567890</code>) olib, shu buyruqni yuboring:\n' +
          '<code>/add_channel -1001234567890</code>',
      };
    }

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

  const { channelId, title, inviteLink } = resolved;

  const existing = await Channel.findOne({ channelId });
  if (existing) {
    return {
      success: false,
      message: `Bu kanal allaqachon qo'shilgan (${title}).`,
    };
  }

  await Channel.create({ channelId, inviteLink });
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
