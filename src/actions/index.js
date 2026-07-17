import { isUserSubscribed } from '../services/subscription.service.js';
import { handleSubscribedUser } from '../commands/start.command.js';
import { subscriptionKeyboard } from '../keyboards/index.js';
import { resetAllParticipants } from '../services/participant.service.js';
import { adminOnly } from '../middlewares/admin.middleware.js';
import { isContestActive, getContestEndLabel } from '../utils/contest.js';
import { logger } from '../utils/logger.js';

/**
 * Barcha callback query (inline tugma bosilganda) handlerlarini ro'yxatdan o'tkazadi.
 * @param {import('telegraf').Telegraf} bot
 */
export function registerActions(bot) {
  // ─── check_subscription ───────────────────────────────────────────────────
  bot.action('check_subscription', async (ctx) => {
    await ctx.answerCbQuery();

    const { id: userId, username, first_name: firstName } = ctx.from;

    // Konkurs tugaganmi?
    if (!isContestActive()) {
      await ctx.editMessageText(
        `⏰ <b>Konkurs o'z nihoyasiga yetdi.</b>\n\nKonkurs <b>${getContestEndLabel()}</b> da yakunlandi.`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    const subscribed = await isUserSubscribed({ telegram: ctx.telegram }, userId);

    if (!subscribed) {
      await ctx.editMessageText(
        `❌ <b>Siz hali kanalga a'zo bo'lmagansiz.</b>\n\n` +
        `Avval kanalga a'zo bo'ling, so'ng <b>Tekshirish</b> tugmasini bosing.`,
        {
          parse_mode: 'HTML',
          ...subscriptionKeyboard(),
        }
      );
      return;
    }

    // A'zo bo'ldi — eski xabarni yangilash va ro'yxatdan o'tkazish
    await ctx.editMessageText(
      `✅ <b>A'zolik tasdiqlandi!</b>\n\nSiz ro'yxatga olinmoqdasiz...`,
      { parse_mode: 'HTML' }
    );

    await handleSubscribedUser(ctx, { userId, username, firstName });
  });

  // ─── confirm_reset ────────────────────────────────────────────────────────
  bot.action('confirm_reset', adminOnly, async (ctx) => {
    await ctx.answerCbQuery("O'chirilmoqda...");
    logger.warn({ adminId: ctx.from?.id }, 'Admin barcha ma\'lumotlarni o\'chirmoqda');

    const deleted = await resetAllParticipants();

    await ctx.editMessageText(
      `✅ <b>Tozalash yakunlandi.</b>\n\n` +
      `<b>${deleted}</b> ta ishtirokchi o'chirildi. Konkurs endi bo'sh.`,
      { parse_mode: 'HTML' }
    );
  });

  // ─── cancel_reset ─────────────────────────────────────────────────────────
  bot.action('cancel_reset', adminOnly, async (ctx) => {
    await ctx.answerCbQuery('Bekor qilindi.');
    await ctx.editMessageText('❌ <b>Tozalash bekor qilindi.</b>', {
      parse_mode: 'HTML',
    });
  });
}
