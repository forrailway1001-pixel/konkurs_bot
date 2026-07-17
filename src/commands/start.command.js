import { isUserSubscribed } from '../services/subscription.service.js';
import { registerParticipant } from '../services/participant.service.js';
import { subscriptionKeyboard } from '../keyboards/index.js';
import { isContestActive, getContestEndLabel } from '../utils/contest.js';
import { logger } from '../utils/logger.js';

// ─── Xabar shablonlari ────────────────────────────────────────────────────────

/** Botga kirganida birinchi ko'rinadigan xabar (a'zo bo'lmagan) */
function welcomeMessage() {
  return (
    `🌟 <b>Eclipse kanalining konkurs botiga xush kelibsiz!</b>\n\n` +
    `Konkursda qatnashish uchun avval kanalimizga a'zo bo'lishingiz kerak.\n\n` +
    `👇 Quyidagi tugmani bosib kanalga o'ting, so'ng <b>Tekshirish</b> tugmasini bosing.`
  );
}

/** Yangi ishtirokchi uchun tabrik xabari */
function newParticipantMessage(firstName, ticketNumber) {
  return (
    `🎉 <b>Tabriklaymiz, ${firstName}!</b>\n\n` +
    `Siz konkurs qatnashchisiga aylandingiz!\n\n` +
    `🎟 Sizning raqamingiz:\n\n` +
    `<code>╔══════════════╗\n` +
    `║   № ${String(ticketNumber).padStart(3, ' ')}        ║\n` +
    `╚══════════════╝</code>\n\n` +
    `🗓 Konkurs <b>${getContestEndLabel()}</b> da tugaydi.\n\n` +
    `Omad tilaymiz!`
  );
}

/** Allaqachon ro'yxatdan o'tgan foydalanuvchi uchun */
function alreadyRegisteredMessage(ticketNumber) {
  return (
    `✅ <b>Siz allaqachon konkurs ishtirokchisisiz!</b>\n\n` +
    `🎟 Sizning raqamingiz:\n\n` +
    `<code>╔══════════════╗\n` +
    `║   № ${String(ticketNumber).padStart(3, ' ')}        ║\n` +
    `╚══════════════╝</code>\n\n` +
    `🗓 Konkurs <b>${getContestEndLabel()}</b> da tugaydi.\n\n` +
    `Omad tilaymiz!`
  );
}

// ─── Handlers ────────────────────────────────────────────────────────────────

/**
 * /start buyrug'ini qayta ishlaydi.
 *
 * Tartib:
 *  1. Konkurs tugaganmi? → "Konkurs nihoyasiga yetdi"
 *  2. Kanalga a'zomi?   → yo'q bo'lsa tugmali xabar
 *  3. Bazada bormi?     → mavjud raqamni qaytaradi
 *  4. Yangi foydalanuvchi → unikal raqam beradi
 *
 * @param {import('telegraf').Context} ctx
 */
export async function startCommand(ctx) {
  const { id: userId, username, first_name: firstName } = ctx.from;
  logger.info({ userId, username }, '/start buyrug\'i keldi');

  // 1. Konkurs vaqti tugaganmi?
  if (!isContestActive()) {
    await ctx.replyWithHTML(
      `⏰ <b>Konkurs o'z nihoyasiga yetdi.</b>\n\n` +
      `Konkurs <b>${getContestEndLabel()}</b> da yakunlandi.\n` +
      `Keyingi konkurslarda ko'rishguncha! 👋`
    );
    return;
  }

  // 2. Kanalga a'zoligini tekshirish
  const subscribed = await isUserSubscribed({ telegram: ctx.telegram }, userId);

  if (!subscribed) {
    await ctx.replyWithHTML(welcomeMessage(), subscriptionKeyboard());
    return;
  }

  // 3–4. A'zo — ro'yxatdan o'tkazish
  await handleSubscribedUser(ctx, { userId, username, firstName });
}

/**
 * A'zolik tasdiqlangandan keyin ro'yxatdan o'tkazish.
 * /start va check_subscription action ikkisi ham shu funksiyani chaqiradi.
 *
 * @param {import('telegraf').Context} ctx
 * @param {{ userId: number, username: string|null, firstName: string }} userData
 */
export async function handleSubscribedUser(ctx, userData) {
  const result = await registerParticipant(userData);

  const { participant, isNew } = result;

  if (!isNew) {
    await ctx.replyWithHTML(alreadyRegisteredMessage(participant.ticketNumber));
    return;
  }

  await ctx.replyWithHTML(
    newParticipantMessage(userData.firstName, participant.ticketNumber)
  );
  logger.info(
    { userId: userData.userId, ticketNumber: participant.ticketNumber },
    'Yangi ishtirokchi ro\'yxatga olindi'
  );
}
