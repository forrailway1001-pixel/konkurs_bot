import { Telegraf } from 'telegraf';
import { config } from '../config/index.js';
import { loggingMiddleware } from '../middlewares/logging.middleware.js';
import { errorHandler } from '../middlewares/error.middleware.js';
import { adminOnly, superAdminOnly } from '../middlewares/admin.middleware.js';
import { startCommand } from '../commands/start.command.js';
import { statsCommand } from '../commands/stats.command.js';
import { winnerCommand } from '../commands/winner.command.js';
import { exportCommand } from '../commands/export.command.js';
import { resetCommand } from '../commands/reset.command.js';
import { addCommand } from '../commands/add.command.js';
import { endDateCommand } from '../commands/end-date.command.js';
import { channelsCommand, addChannelCommand, delChannelCommand } from '../commands/channel.command.js';
import { adminsCommand, addAdminCommand, delAdminCommand } from '../commands/admins.command.js';
import { registerActions } from '../actions/index.js';
import { getAllDynamicAdmins } from '../services/admin.service.js';
import { logger } from '../utils/logger.js';

/**
 * Bot ekzemplyarini yaratadi, barcha middleware va handlerlarni bog'laydi.
 * @returns {import('telegraf').Telegraf}
 */
export function createBot() {
  const bot = new Telegraf(config.BOT_TOKEN);

  // ── Global middleware ─────────────────────────────────────────────────────
  bot.use(loggingMiddleware);

  // ── Foydalanuvchi buyruqlari ──────────────────────────────────────────────
  bot.start(startCommand);

  // ── Admin buyruqlari ──────────────────────────────────────────────────────
  bot.command('stats',    adminOnly, statsCommand);
  bot.command('winner',   adminOnly, winnerCommand);
  bot.command('export',   adminOnly, exportCommand);
  bot.command('reset',    adminOnly, resetCommand);
  bot.command('add',      adminOnly, addCommand);
  bot.command('end_date', adminOnly, endDateCommand);

  // ── SUPER ADMIN buyruqlari ────────────────────────────────────────────────
  bot.command('admins',      superAdminOnly, adminsCommand);
  bot.command('add_admin',   superAdminOnly, addAdminCommand);
  bot.command('del_admin',   superAdminOnly, delAdminCommand);
  bot.command('channels',    superAdminOnly, channelsCommand);
  bot.command('add_channel', superAdminOnly, addChannelCommand);
  bot.command('del_channel', superAdminOnly, delChannelCommand);

  // ── Inline tugma callbacklari ─────────────────────────────────────────────
  registerActions(bot);

  // ── Global xatolik handleri ───────────────────────────────────────────────
  bot.catch(errorHandler);

  logger.info('Bot yaratildi va sozlandi');
  return bot;
}

/**
 * BotFather'da ko'rinadigan buyruqlar ro'yxatini o'rnatadi.
 * @param {import('telegraf').Telegraf} bot
 */
export async function setBotCommands(bot) {
  // Oddiy foydalanuvchilar uchun umumiy menu
  await bot.telegram.setMyCommands([
    { command: 'start', description: '🎟 Konkursda qatnashish' },
  ]);

  const adminCommands = [
    { command: 'start',    description: '🎟 Konkursda qatnashish' },
    { command: 'stats',    description: '📊 Statistika' },
    { command: 'add',      description: '➕ Qo\'lda ishtirokchi qo\'shish' },
    { command: 'end_date', description: '📅 Konkurs tugash sanasini belgilash' },
    { command: 'winner',   description: '🏆 G\'olibni aniqlash' },
    { command: 'export',   description: '📄 CSV yuklab olish' },
    { command: 'reset',    description: '⚠️ Barcha ma\'lumotlarni tozalash' },
  ];

  const superAdminCommands = [
    ...adminCommands,
    { command: 'admins',      description: '👥 Adminlar ro\'yxati' },
    { command: 'add_admin',   description: '➕ Admin qo\'shish' },
    { command: 'del_admin',   description: '➖ Admin o\'chirish' },
    { command: 'channels',    description: '📢 Kanallar ro\'yxati' },
    { command: 'add_channel', description: '➕ Kanal qo\'shish' },
    { command: 'del_channel', description: '➖ Kanal o\'chirish' },
  ];

  // SUPER ADMIN
  try {
    await bot.telegram.setMyCommands(superAdminCommands, {
      scope: { type: 'chat', chat_id: Number(config.SUPER_ADMIN) },
    });
  } catch (err) {
    logger.warn({ err }, 'SUPER ADMIN uchun buyruqlarni o\'rnatib bo\'lmadi');
  }

  // DB dagi dinamik adminlar
  try {
    const dynamicAdmins = await getAllDynamicAdmins();
    for (const admin of dynamicAdmins) {
      if (admin.userId === config.SUPER_ADMIN) continue;
      try {
        await bot.telegram.setMyCommands(adminCommands, {
          scope: { type: 'chat', chat_id: Number(admin.userId) },
        });
      } catch (err) {
        logger.warn({ adminId: admin.userId, err }, 'Dinamik admin uchun buyruqlarni o\'rnatib bo\'lmadi');
      }
    }
  } catch (err) {
    logger.warn({ err }, 'Dinamik adminlar ro\'yxatini DB dan olib bo\'lmadi');
  }

  logger.info('Bot buyruqlar ro\'yxati o\'rnatildi');
}
