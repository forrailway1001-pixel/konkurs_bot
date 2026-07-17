import { Markup } from 'telegraf';
import { config } from '../config/index.js';

/**
 * Kanal havolasini hosil qiladi.
 */
function channelUrl() {
  return config.CHANNEL_ID.startsWith('@')
    ? `https://t.me/${config.CHANNEL_ID.slice(1)}`
    : `https://t.me/c/${config.CHANNEL_ID}`;
}

/**
 * A'zo bo'lmagan foydalanuvchi uchun klaviatura:
 *   📢 A'zo bo'lish   — kanalga o'tadi
 *   ✅ Tekshirish     — a'zolikni qayta tekshiradi
 */
export function subscriptionKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.url("📢 A'zo bo'lish", channelUrl())],
    [Markup.button.callback('✅ Tekshirish', 'check_subscription')],
  ]);
}

/**
 * /reset admin buyrug'i uchun tasdiqlash klaviaturasi.
 */
export function confirmResetKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("✅ Ha, o'chirilsin", 'confirm_reset'),
      Markup.button.callback('❌ Bekor qilish', 'cancel_reset'),
    ],
  ]);
}
