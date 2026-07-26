import { pickWinners } from '../services/participant.service.js';
import { logger } from '../utils/logger.js';

/**
 * /winner [count] — tasodifiy g'olib(lar)ni tanlaydi (faqat admin).
 * @param {import('telegraf').Context} ctx
 */
export async function winnerCommand(ctx) {
  logger.info({ adminId: ctx.from?.id }, '/winner buyrug\'i keldi');

  const args = ctx.message.text.trim().split(/\s+/).slice(1);
  let count = 1;
  if (args.length > 0) {
    const parsed = parseInt(args[0], 10);
    if (!isNaN(parsed) && parsed > 0) {
      count = parsed;
    }
  }

  const winners = await pickWinners(count);

  if (!winners || winners.length === 0) {
    await ctx.replyWithHTML(
      '⚠️ <b>Hozircha ishtirokchilar yo\'q.</b>\n\nKonkursga hech kim ro\'yxatdan o\'tmagan.'
    );
    return;
  }

  let message = `🏆 <b>${winners.length}ta g'olib aniqlandi!</b>\n\n`;

  winners.forEach((winner, index) => {
    const nameLink = `<a href="tg://user?id=${winner.userId}">${winner.firstName}</a>`;
    message += `${index + 1}-o'rin: ${winner.ticketNumber}-raqamli ishtirokchi! — ${nameLink}\n`;
  });

  await ctx.replyWithHTML(message);
}
