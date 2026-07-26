import { addChannel, removeChannel, getAllChannels } from '../services/channel.service.js';

export async function channelsCommand(ctx) {
  const channels = await getAllChannels();
  if (channels.length === 0) {
    return ctx.reply('⚠️ Hozircha hech qanday kanal yo\'q.');
  }

  let msg = '📢 <b>Majburiy obuna kanallari:</b>\n\n';
  channels.forEach((ch, i) => {
    msg += `${i + 1}. <code>${ch.channelId}</code>\n`;
  });

  await ctx.replyWithHTML(msg);
}

export async function addChannelCommand(ctx) {
  // Qo'llab-quvvatlanadigan formatlar:
  //   /add_channel @username
  //   /add_channel -100xxxxxxxxxx
  //   /add_channel https://t.me/username
  //   /add_channel https://t.me/+InviteHash   ← yopiq kanal
  //   /add_channel https://t.me/joinchat/xxx  ← eski yopiq kanal
  const args = ctx.message.text.split(' ').filter(Boolean);
  if (args.length !== 2) {
    return ctx.replyWithHTML(
      '⚠️ <b>Foydalanish:</b>\n' +
      '<code>/add_channel @username</code>\n' +
      '<code>/add_channel -100xxxxxxxxxx</code>\n' +
      '<code>/add_channel https://t.me/username</code>\n' +
      '<code>/add_channel https://t.me/+InviteHash</code>'
    );
  }

  const res = await addChannel(ctx.telegram, args[1]);
  if (!res.success) {
    return ctx.replyWithHTML(`⚠️ ${res.message}`);
  }
  await ctx.replyWithHTML(
    `✅ Kanal qo'shildi!\n\n` +
    `📢 <b>${res.title}</b>\n` +
    `🆔 <code>${res.channelId}</code>`
  );
}

export async function delChannelCommand(ctx) {
  const args = ctx.message.text.split(' ').filter(Boolean);
  if (args.length !== 2) {
    return ctx.replyWithHTML(
      '⚠️ <b>Foydalanish:</b>\n' +
      '<code>/del_channel @username</code>\n' +
      '<code>/del_channel -100xxxxxxxxxx</code>\n' +
      '<code>/del_channel https://t.me/username</code>\n' +
      '<code>/del_channel https://t.me/+InviteHash</code>'
    );
  }

  const res = await removeChannel(ctx.telegram, args[1]);
  if (!res.success) {
    return ctx.replyWithHTML(`⚠️ ${res.message}`);
  }
  await ctx.replyWithHTML(
    `✅ Kanal o'chirildi!\n\n` +
    `📢 <b>${res.title}</b>\n` +
    `🆔 <code>${res.channelId}</code>`
  );
}
