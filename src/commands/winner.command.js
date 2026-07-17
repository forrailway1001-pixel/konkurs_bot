import { pickWinner } from '../services/participant.service.js';
import { logger } from '../utils/logger.js';

/**
 * /winner — tasodifiy g'olib tanlaydi (faqat admin).
 * @param {import('telegraf').Context} ctx
 */
export async function winnerCommand(ctx) {
  logger.info({ adminId: ctx.from?.id }, '/winner buyrug\'i keldi');

  const winner = await pickWinner();

  if (!winner) {
    await ctx.replyWithHTML(
      '⚠️ <b>Hozircha ishtirokchilar yo\'q.</b>\n\nKonkursga hech kim ro\'yxatdan o\'tmagan.'
    );
    return;
  }

  const usernameDisplay = winner.username ? `@${winner.username}` : '—';

  const message =
    `🏆 <b>Konkurs G'olibi</b>\n\n` +
    `👤 Ismi: <b>${winner.firstName}</b>\n` +
    `🔗 Username: <b>${usernameDisplay}</b>\n` +
    `🎟 Raqami: <code>${winner.ticketNumber}</code>\n` +
    `🆔 Telegram ID: <code>${winner.userId}</code>`;

  await ctx.replyWithHTML(message);
}
