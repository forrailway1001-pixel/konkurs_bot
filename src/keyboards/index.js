import { Markup } from 'telegraf';

/**
 * Saqlangan channelId dan foydalanuvchi bosadigan havola hosil qiladi.
 *
 * Qo'llab-quvvatlanadigan formatlar (DB da qanday saqlangan bo'lsa):
 *   -100xxxxxxxxxx  → https://t.me/c/xxxxxxxxxx   (yopiq / numeric)
 *   @username       → https://t.me/username
 *   username        → https://t.me/username        (@ siz saqlangan bo'lsa)
 */
function channelUrl(channelId) {
  const s = String(channelId).trim();

  // Numeric id: manfiy (masalan -1001234567890) yoki faqat raqam
  if (/^-?\d+$/.test(s)) {
    // -100 prefiksini olib tashlaymiz
    const bare = s.replace(/^-100/, '');
    return `https://t.me/c/${bare}`;
  }

  // @username formatida saqlangan
  if (s.startsWith('@')) {
    return `https://t.me/${s.slice(1)}`;
  }

  // @ siz saqlangan username
  return `https://t.me/${s}`;
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
