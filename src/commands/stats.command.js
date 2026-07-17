import { getContestStats, getAllParticipants } from '../services/participant.service.js';
import { isContestActive, getContestEndLabel } from '../utils/contest.js';
import { logger } from '../utils/logger.js';

/**
 * /stats — konkurs statistikasini ko'rsatadi (faqat admin).
 * @param {import('telegraf').Context} ctx
 */
export async function statsCommand(ctx) {
  logger.info({ adminId: ctx.from?.id }, '/stats buyrug\'i keldi');

  const { total } = await getContestStats();
  const holat = isContestActive()
    ? `🟢 Faol (${getContestEndLabel()} gacha)`
    : `🔴 Yakunlangan`;

  const participants = await getAllParticipants();
  
  // Ishtirokchilar ro'yxatini shakllantirish
  let listStr = '';
  if (participants.length > 0) {
    listStr = '\n\n📝 <b>Ishtirokchilar ro\'yxati:</b>\n';
    participants.forEach((p) => {
      listStr += `<b>${p.ticketNumber}.</b> <a href="tg://user?id=${p.userId}">${p.firstName}</a>\n`;
    });
  } else {
    listStr = '\n\n📝 <b>Hozircha ishtirokchilar yo\'q.</b>';
  }

  const message =
    `📊 <b>Konkurs Statistikasi</b>\n\n` +
    `📌 Holat: ${holat}\n` +
    `👥 Jami ishtirokchilar: <b>${total}</b>` +
    listStr;

  // Telegram bitta xabarda 4096 belgi qabul qiladi.
  // Shuning uchun matn uzun bo'lsa uni qismlarga bo'lib jo'natamiz.
  const MAX_LENGTH = 4000;
  for (let i = 0; i < message.length; i += MAX_LENGTH) {
    await ctx.replyWithHTML(message.substring(i, i + MAX_LENGTH));
  }
}
