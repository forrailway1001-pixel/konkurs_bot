import { setContestEndDate, getContestEndDate } from '../services/contest-settings.service.js';
import { getContestEndLabelAsync } from '../utils/contest.js';
import { logger } from '../utils/logger.js';

/**
 * /end_date — Konkurs tugash vaqtini belgilaydi (faqat admin).
 *
 * Foydalanish:
 *   /end_date                  → hozirgi qiymatni ko'rsatadi
 *   /end_date 2026-07-25 20:00 → sana va vaqt (Toshkent vaqti, UTC+5)
 *   /end_date clear            → tugash sanasini o'chiradi (cheksiz faol)
 *
 * @param {import('telegraf').Context} ctx
 */
export async function endDateCommand(ctx) {
  logger.info({ adminId: ctx.from?.id }, '/end_date buyrug\'i keldi');

  const args = ctx.message.text.trim().split(/\s+/).slice(1);

  // Argumentsiz — hozirgi qiymatni ko'rsatish
  if (args.length === 0) {
    const endDate = await getContestEndDate();
    const label = await getContestEndLabelAsync();

    const helpText =
      `\n\n📌 <b>Foydalanish:</b>\n` +
      `Belgilash: <code>/end_date YYYY-MM-DD HH:MM</code>\n` +
      `Masalan:   <code>/end_date 2026-07-25 20:00</code>\n` +
      `O'chirish:  <code>/end_date clear</code>\n\n` +
      `⚠️ Vaqt <b>Toshkent vaqti (UTC+5)</b> da kiritiladi.`;

    if (!endDate) {
      return ctx.replyWithHTML(
        `📅 <b>Konkurs tugash sanasi</b>\n\n` +
        `⏳ Hozircha tugash sanasi <b>belgilanmagan</b>.\n` +
        `Konkurs cheksiz faol bo'lib qoladi.` +
        helpText
      );
    }

    return ctx.replyWithHTML(
      `📅 <b>Konkurs tugash sanasi</b>\n\n` +
      `🗓 Hozirgi qiymat: <b>${label}</b>\n` +
      `🕐 UTC: <code>${endDate.toISOString()}</code>` +
      helpText
    );
  }

  // "clear" — tugash sanasini o'chirish
  if (args[0].toLowerCase() === 'clear') {
    await setContestEndDate(null);
    logger.info({ adminId: ctx.from?.id }, 'Konkurs tugash sanasi o\'chirildi');
    return ctx.replyWithHTML(
      `✅ <b>Tugash sanasi o'chirildi.</b>\n\n` +
      `Konkurs endi cheksiz faol bo'ladi.`
    );
  }

  // Formatni tekshirish: 2 ta argument kerak (sana + vaqt)
  const dateStr = args[0]; // "2026-07-25"
  const timeStr = args[1]; // "20:00"

  if (!dateStr || !timeStr) {
    return ctx.replyWithHTML(
      `⚠️ <b>Noto'g'ri format.</b>\n\n` +
      `To'g'ri foydalanish:\n` +
      `<code>/end_date YYYY-MM-DD HH:MM</code>\n\n` +
      `Masalan: <code>/end_date 2026-07-25 20:00</code>\n` +
      `Vaqt <b>Toshkent vaqti (UTC+5)</b> da kiritiladi.`
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return ctx.replyWithHTML(
      `⚠️ Sana formati noto'g'ri.\n` +
      `<code>YYYY-MM-DD</code> formatida kiriting.\n` +
      `Masalan: <code>2026-07-25</code>`
    );
  }

  if (!/^\d{2}:\d{2}$/.test(timeStr)) {
    return ctx.replyWithHTML(
      `⚠️ Vaqt formati noto'g'ri.\n` +
      `<code>HH:MM</code> formatida kiriting.\n` +
      `Masalan: <code>20:00</code>`
    );
  }

  // Toshkent (UTC+5) → UTC
  const localDateTimeStr = `${dateStr}T${timeStr}:00`;
  const utcDate = new Date(new Date(localDateTimeStr).getTime() - 5 * 60 * 60 * 1000);

  if (isNaN(utcDate.getTime())) {
    return ctx.replyWithHTML(`⚠️ Kiritilgan sana yoki vaqt noto'g'ri.`);
  }

  if (utcDate < new Date()) {
    return ctx.replyWithHTML(
      `⚠️ <b>Kiritilgan vaqt o'tmishda!</b>\n\n` +
      `Kelajakdagi sana va vaqt kiriting.`
    );
  }

  await setContestEndDate(utcDate);
  const label = await getContestEndLabelAsync();

  logger.info({ adminId: ctx.from?.id, endDate: utcDate }, 'Konkurs tugash sanasi o\'rnatildi');

  await ctx.replyWithHTML(
    `✅ <b>Konkurs tugash sanasi o'rnatildi!</b>\n\n` +
    `🗓 Yangi tugash vaqti: <b>${label}</b>\n` +
    `🕐 UTC: <code>${utcDate.toISOString()}</code>`
  );
}
