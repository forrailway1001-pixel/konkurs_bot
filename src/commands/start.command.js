import { config } from '../config/index.js';
import { checkAllSubscriptions } from "../services/subscription.service.js";
import { registerParticipant } from "../services/participant.service.js";
import { subscriptionKeyboard } from "../keyboards/index.js";
import { isContestActiveAsync, getContestEndLabelAsync } from "../utils/contest.js";
import { isAdmin } from '../services/admin.service.js';
import { logger } from "../utils/logger.js";

// ─── Xabar shablonlari ────────────────────────────────────────────────────────

/** Botga kirganida birinchi ko'rinadigan xabar (a'zo bo'lmagan) */
function welcomeMessage() {
  return (
    `🌟 <b>Konkursimizning botiga xush kelibsiz!</b>\n\n` +
    `Konkursda ishtirok etish uchun quyidagi kanallarga a'zo bo'ling, so'ng <b>Tekshirish</b> tugmasini bosing.`
  );
}

/** Yangi ishtirokchi uchun tabrik xabari */
async function newParticipantMessage(firstName, ticketNumber) {
  const label = await getContestEndLabelAsync();
  return (
    `🎉 <b>Tabriklaymiz, ${firstName}!</b>\n\n` +
    `Siz konkurs qatnashchisiga aylandingiz!\n\n` +
    `🎟 Sizning raqamingiz:\n\n` +
    `<code>╔══════════════╗\n` +
    `║   № ${String(ticketNumber).padStart(3, " ")}        ║\n` +
    `╚══════════════╝</code>\n\n` +
    `🗓 Konkurs <b>${label}</b> da tugaydi.\n\n` +
    `Omad tilaymiz!`
  );
}

/** Allaqachon ro'yxatdan o'tgan foydalanuvchi uchun */
async function alreadyRegisteredMessage(ticketNumber) {
  const label = await getContestEndLabelAsync();
  return (
    `✅ <b>Siz allaqachon konkurs ishtirokchisisiz!</b>\n\n` +
    `🎟 Sizning raqamingiz:\n\n` +
    `<code>╔══════════════╗\n` +
    `║   № ${String(ticketNumber).padStart(3, " ")}        ║\n` +
    `╚══════════════╝</code>\n\n` +
    `🗓 Konkurs <b>${label}</b> da tugaydi.\n\n` +
    `Omad tilaymiz!`
  );
}

// ─── Handlers ────────────────────────────────────────────────────────────────

/**
 * /start buyrug'ini qayta ishlaydi.
 * @param {import('telegraf').Context} ctx
 */
export async function startCommand(ctx) {
  const { id: userId, username, first_name: firstName } = ctx.from;
  logger.info({ userId, username }, "/start buyrug'i keldi");

  // Admin ekanligini tekshirish (Adminlar ro'yxatdan o'tmaydi)
  const strUserId = String(userId);
  const adminCheck = await isAdmin(strUserId);
  if (adminCheck) {
    await ctx.replyWithHTML(
      `👋 <b>Xush kelibsiz, Admin (${firstName})!</b>\n\n` +
      `Siz bot administratori bo'lganingiz uchun konkursda ishtirokchi sifatida ro'yxatga olinmaysiz va majburiy obuna talab qilinmaydi.\n\n` +
      `Botni boshqarish uchun pastki chap burchakdagi <b>Menu</b> tugmasidan foydalaning.`
    );
    return;
  }

  // 1. Konkurs vaqti tugaganmi?
  const active = await isContestActiveAsync();
  if (!active) {
    const label = await getContestEndLabelAsync();
    await ctx.replyWithHTML(
      `⏰ <b>Konkurs o'z nihoyasiga yetdi.</b>\n\n` +
        `Konkurs <b>${label}</b> da yakunlandi.\n` +
        `Keyingi konkurslarda ko'rishguncha! 👋`,
    );
    return;
  }

  // 2. Kanalga a'zoligini tekshirish
  const resultObj = await checkAllSubscriptions(
    { telegram: ctx.telegram },
    userId,
  );

  if (!resultObj.isSubscribed) {
    await ctx.replyWithHTML(
      welcomeMessage(),
      subscriptionKeyboard(resultObj.channels),
    );
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
    await ctx.replyWithHTML(await alreadyRegisteredMessage(participant.ticketNumber));
    return;
  }

  await ctx.replyWithHTML(
    await newParticipantMessage(userData.firstName, participant.ticketNumber),
  );
  logger.info(
    { userId: userData.userId, ticketNumber: participant.ticketNumber },
    "Yangi ishtirokchi ro'yxatga olindi",
  );
}
