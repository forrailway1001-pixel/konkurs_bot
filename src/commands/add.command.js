import { registerParticipant } from '../services/participant.service.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * /add <userid> — Admin tomonidan qo'lda ishtirokchi qo'shish.
 * Kanal orqali ishtirokchi ma'lumotlarini (ismi, username) avtomatik o'qib oladi.
 *
 * @param {import('telegraf').Context} ctx
 */
export async function addCommand(ctx) {
  logger.info({ adminId: ctx.from?.id }, '/add buyrug\'i keldi');

  // /add 7525689838 1
  const args = ctx.message.text.split(' ').filter(Boolean);
  if (args.length !== 3) {
    await ctx.replyWithHTML('⚠️ <b>Foydalanish:</b> <code>/add USER_ID TICKET_ID</code>\n\nMasalan: <code>/add 7525689838 1</code>');
    return;
  }

  const targetUserId = Number(args[1]);
  if (isNaN(targetUserId)) {
    await ctx.reply('⚠️ USER_ID faqat raqamlardan iborat bo\'lishi kerak.');
    return;
  }

  const targetTicketNumber = Number(args[2]);
  if (isNaN(targetTicketNumber) || targetTicketNumber < 1) {
    await ctx.reply('⚠️ TICKET_ID musbat raqam bo\'lishi kerak.');
    return;
  }

  try {
    // Kanal orqali ishtirokchi ma'lumotlarini (ismi va hokazo) o'qib olish
    const { getAllChannels } = await import('../services/channel.service.js');
    const channels = await getAllChannels();
    let member = null;
    
    // Foydalanuvchini istalgan bir kanaldan izlab ko'ramiz
    for (const ch of channels) {
      try {
        member = await ctx.telegram.getChatMember(ch.channelId, targetUserId);
        if (member) break;
      } catch (e) {
        // Bu kanaldan topilmadi, keyingisiga o'tamiz
      }
    }

    if (!member) {
      throw new Error('User not found in any channel');
    }
    
    const userData = {
      userId: member.user.id,
      username: member.user.username ?? null,
      firstName: member.user.first_name || 'Ishtirokchi',
      ticketNumber: targetTicketNumber
    };

    // Bazaga ro'yxatdan o'tkazish
    const { participant, isNew, error } = await registerParticipant(userData);

    // tg://user?id=... formatida havola (profilga yo'naltiradi)
    const userLink = `<a href="tg://user?id=${targetUserId}">${userData.firstName}</a>`;

    if (error) {
      await ctx.replyWithHTML(`❌ <b>Xatolik:</b> ${error}\nKimda ekanligini bilish uchun /stats dagi ro'yxatni ko'ring.`);
      return;
    }

    if (!isNew) {
      await ctx.replyWithHTML(`⚠️ ${userLink} allaqachon bazada bor.\nUning raqami: <b>${participant.ticketNumber}</b>`);
      return;
    }

    await ctx.replyWithHTML(`✅ ${userLink} bazaga muvaffaqiyatli qo'shildi!\nUnga berilgan raqam: <b>${participant.ticketNumber}</b>`);

  } catch (error) {
    logger.error({ err: error, targetUserId }, 'Foydalanuvchini kanal orqali topib bo\'lmadi');
    await ctx.replyWithHTML(`❌ <b>Topilmadi:</b> <code>${targetUserId}</code> raqamli foydalanuvchi kanalda yo'q yoki bot u bilan hech qachon aloqada bo'lmagan.\n\nIltimos, u avval kanalga a'zo ekanligiga ishonch hosil qiling.`);
  }
}
