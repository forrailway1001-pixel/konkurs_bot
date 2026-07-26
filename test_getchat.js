import { Telegraf } from 'telegraf';
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN);

async function test() {
  try {
    const res = await bot.telegram.getChat('https://t.me/+c5bEzRCrsNtkOWQy');
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
