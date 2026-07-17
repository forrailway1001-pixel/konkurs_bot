import { Markup } from 'telegraf';

/**
 * Kanal havolasini hosil qiladi.
 */
function channelUrl(channelId) {
  return channelId.startsWith('@')
    ? `https://t.me/${channelId.slice(1)}`
    : `https://t.me/c/${channelId.replace('-100', '')}`;
}

/**
 * A'zo bo'lmagan foydalanuvchi uchun klaviatura:
 * Har bir kanal uchun alohida tugma yaratadi.
 */
export function subscriptionKeyboard(channels) {
  const buttons = channels.map((ch, index) => {
    const title = channels.length > 1 
      ? `📢 ${index + 1}-kanalga a'zo bo'lish` 
      : `📢 A'zo bo'lish`;
    return [Markup.button.url(title, channelUrl(ch.channelId))];
  });

  buttons.push([Markup.button.callback('✅ Tekshirish', 'check_subscription')]);
  return Markup.inlineKeyboard(buttons);
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
