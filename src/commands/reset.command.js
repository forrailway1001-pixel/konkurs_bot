import { confirmResetKeyboard } from '../keyboards/index.js';
import { logger } from '../utils/logger.js';

/**
 * /reset — tasdiqlashdan so'ng barcha ishtirokchilarni o'chiradi (faqat admin).
 * @param {import('telegraf').Context} ctx
 */
export async function resetCommand(ctx) {
  logger.info({ adminId: ctx.from?.id }, '/reset buyrug\'i keldi');

  await ctx.replyWithHTML(
    `⚠️ <b>Diqqat!</b>\n\n` +
      `Bu amal barcha ishtirokchilarni va raqamlarni <b>butunlay o'chiradi</b>.\n\n` +
      `Davom etishga ishonchingiz komilmi?`,
    confirmResetKeyboard()
  );
}
