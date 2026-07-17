import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from './database/connection.js';
import { createBot, setBotCommands } from './bot/index.js';
import { logger } from './utils/logger.js';

/**
 * Dastur kirish nuqtasi.
 *
 * Ishga tushish tartibi:
 *  1. Config tekshiruvi (Zod — config/index.js import qilinganda bajariladi)
 *  2. MongoDB'ga ulanish
 *  3. Bot yaratish va buyruqlarni o'rnatish
 *  4. Long-polling boshlanadi
 *  5. SIGINT / SIGTERM — to'g'ri yopish
 */
async function main() {
  logger.info('konkurs-bot ishga tushmoqda…');

  await connectDatabase();

  const bot = createBot();
  await setBotCommands(bot);

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info({ signal }, 'To\'xtatish signali olindi');
    bot.stop(signal);
    await disconnectDatabase();
    logger.info('Bot to\'xtatildi');
    process.exit(0);
  };

  process.once('SIGINT',  () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  await bot.launch();
  logger.info('Bot ishga tushdi va yangi xabarlarni kutmoqda ✅');
}

main().catch((err) => {
  logger.fatal({ err }, 'Ishga tushishda kritik xatolik');
  process.exit(1);
});
