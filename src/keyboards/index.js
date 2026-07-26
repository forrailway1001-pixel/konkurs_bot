import { Markup } from 'telegraf';

/**
 * Saqlangan kanaldan foydalanuvchi bosadigan havola hosil qiladi.
 */
function channelUrl(ch) {
  // Agar bazada tayyor havola (inviteLink) saqlangan bo'lsa, o'shani ishlatamiz
  if (ch.inviteLink) {
    return ch.inviteLink;
  }

  const s = String(ch.channelId).trim();

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
    return [Markup.button.url(title, channelUrl(ch))];
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
