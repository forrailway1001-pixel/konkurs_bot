import { Channel } from '../models/channel.model.js';
import { config } from '../config/index.js';

/**
 * Barcha kanallarni oladi.
 * Agar baza bo'sh bo'lsa, avtomatik ravishda .env dagi kanalni qaytaradi.
 */
export async function getAllChannels() {
  const channels = await Channel.find().lean();
  
  if (channels.length === 0 && config.CHANNEL_ID) {
    return [{ channelId: config.CHANNEL_ID }];
  }
  
  return channels;
}

export async function addChannel(channelId) {
  const existing = await Channel.findOne({ channelId });
  if (existing) {
    return { success: false, message: 'Bu kanal allaqachon qo\'shilgan.' };
  }
  
  await Channel.create({ channelId });
  return { success: true };
}

export async function removeChannel(channelId) {
  const result = await Channel.deleteOne({ channelId });
  if (result.deletedCount === 0) {
    return { success: false, message: 'Bu kanal topilmadi.' };
  }
  return { success: true };
}
