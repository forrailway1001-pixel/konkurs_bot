import {
  getAllDynamicAdmins,
  addAdmin,
  removeAdmin,
} from '../services/admin.service.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * /admins — Barcha adminlar ro'yxatini ko'rsatadi (faqat SUPER ADMIN).
 * @param {import('telegraf').Context} ctx
 */
export async function adminsCommand(ctx) {
  logger.info({ adminId: ctx.from?.id }, '/admins buyrug\'i keldi');

  const dynamicAdmins = await getAllDynamicAdmins();

  let msg = `👑 <b>Adminlar ro'yxati</b>\n\n`;

  // SUPER ADMIN
  msg += `🔴 <b>SUPER ADMIN (statik):</b>\n`;
  msg += `• <code>${config.SUPER_ADMIN}</code>\n\n`;

  // DB dinamik adminlar
  if (dynamicAdmins.length > 0) {
    msg += `🟢 <b>Adminlar (${dynamicAdmins.length} ta):</b>\n`;
    dynamicAdmins.forEach((a, i) => {
      const date = new Date(a.createdAt).toLocaleDateString('uz-UZ');
      const note = a.note ? ` — ${a.note}` : '';
      msg += `${i + 1}. <code>${a.userId}</code>${note} <i>(${date})</i>\n`;
    });
  } else {
    msg += `🟢 <b>Adminlar:</b> hozircha yo'q\n`;
  }

  msg += `\n📌 <b>Buyruqlar:</b>\n`;
  msg += `Qo'shish: <code>/add_admin USER_ID [izoh]</code>\n`;
  msg += `O'chirish: <code>/del_admin USER_ID</code>`;

  await ctx.replyWithHTML(msg);
}

/**
 * /add_admin <user_id> [izoh] — Admin qo'shadi (faqat SUPER ADMIN).
 * @param {import('telegraf').Context} ctx
 */
export async function addAdminCommand(ctx) {
  logger.info({ adminId: ctx.from?.id }, '/add_admin buyrug\'i keldi');

  const args = ctx.message.text.trim().split(/\s+/).slice(1);

  if (args.length < 1) {
    return ctx.replyWithHTML(
      `⚠️ <b>Foydalanish:</b> <code>/add_admin USER_ID [izoh]</code>\n\n` +
      `Masalan: <code>/add_admin 123456789 Abdulloh aka</code>`
    );
  }

  const userId = args[0];
  const note   = args.slice(1).join(' ') || null;

  if (!/^\d+$/.test(userId)) {
    return ctx.reply(`⚠️ USER_ID faqat raqamlardan iborat bo'lishi kerak.`);
  }

  const res = await addAdmin(userId, ctx.from.id, note);
  if (!res.success) {
    return ctx.replyWithHTML(`⚠️ ${res.message}`);
  }

  logger.info({ newAdminId: userId, addedBy: ctx.from?.id }, 'Yangi admin qo\'shildi');

  await ctx.replyWithHTML(
    `✅ <b>Admin qo'shildi!</b>\n\n` +
    `👤 ID: <code>${userId}</code>\n` +
    (note ? `📝 Izoh: ${note}\n` : '') +
    `\n⚠️ Admin bot menyusini ko'rishi uchun /start bosishi kerak.`
  );
}

/**
 * /del_admin <user_id> — Adminni o'chiradi (faqat SUPER ADMIN).
 * @param {import('telegraf').Context} ctx
 */
export async function delAdminCommand(ctx) {
  logger.info({ adminId: ctx.from?.id }, '/del_admin buyrug\'i keldi');

  const args = ctx.message.text.trim().split(/\s+/).slice(1);

  if (args.length < 1) {
    return ctx.replyWithHTML(
      `⚠️ <b>Foydalanish:</b> <code>/del_admin USER_ID</code>\n\n` +
      `Masalan: <code>/del_admin 123456789</code>`
    );
  }

  const userId = args[0];

  if (!/^\d+$/.test(userId)) {
    return ctx.reply(`⚠️ USER_ID faqat raqamlardan iborat bo'lishi kerak.`);
  }

  const res = await removeAdmin(userId);
  if (!res.success) {
    return ctx.replyWithHTML(`⚠️ ${res.message}`);
  }

  logger.info({ removedAdminId: userId, removedBy: ctx.from?.id }, 'Admin o\'chirildi');

  await ctx.replyWithHTML(
    `✅ <b>Admin o'chirildi.</b>\n\n` +
    `👤 ID: <code>${userId}</code>\n` +
    `Foydalanuvchi endi admin huquqlaridan mahrum.`
  );
}
