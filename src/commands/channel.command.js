import { addChannel, removeChannel, getAllChannels } from '../services/channel.service.js';

export async function channelsCommand(ctx) {
  const channels = await getAllChannels();
  if (channels.length === 0) {
    return ctx.reply('⚠️ Hozircha hech qanday kanal yo\'q.');
  }
  
  let msg = '📢 <b>Majburiy obuna kanallari:</b>\n\n';
  channels.forEach((ch, i) => {
    msg += `${i + 1}. ${ch.channelId}\n`;
  });
  
  await ctx.replyWithHTML(msg);
}

export async function addChannelCommand(ctx) {
  const args = ctx.message.text.split(' ').filter(Boolean);
  if (args.length !== 2) {
    return ctx.replyWithHTML('⚠️ <b>Foydalanish:</b> <code>/add_channel @username</code>');
  }

  const res = await addChannel(args[1]);
  if (!res.success) {
    return ctx.reply(`⚠️ ${res.message}`);
  }
  await ctx.reply(`✅ Kanal qo'shildi: ${args[1]}`);
}

export async function delChannelCommand(ctx) {
  const args = ctx.message.text.split(' ').filter(Boolean);
  if (args.length !== 2) {
    return ctx.replyWithHTML('⚠️ <b>Foydalanish:</b> <code>/del_channel @username</code>');
  }

  const res = await removeChannel(args[1]);
  if (!res.success) {
    return ctx.reply(`⚠️ ${res.message}`);
  }
  await ctx.reply(`✅ Kanal o'chirildi: ${args[1]}`);
}
