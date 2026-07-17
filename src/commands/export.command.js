import { getAllParticipants } from '../services/participant.service.js';
import { logger } from '../utils/logger.js';

/**
 * CSV maydonini to'g'ri formatlaydi (qo'shtirnoq va ichki belgilarni himoya qiladi).
 * @param {string | number | null | undefined} value
 * @returns {string}
 */
function csvEscape(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Ishtirokchilar massivini CSV matnga aylantiradi.
 * @param {object[]} participants
 * @returns {string}
 */
function buildCsv(participants) {
  const header = [
    'Raqam',
    'Telegram ID',
    'Username',
    'Ismi',
    "Ro'yxatdan o'tgan vaqt",
  ]
    .map(csvEscape)
    .join(',');

  const rows = participants.map((p) =>
    [
      p.ticketNumber,
      p.userId,
      p.username ?? '',
      p.firstName,
      new Date(p.createdAt).toISOString(),
    ]
      .map(csvEscape)
      .join(',')
  );

  return [header, ...rows].join('\r\n');
}

/**
 * /export — barcha ishtirokchilarni CSV fayl sifatida yuboradi (faqat admin).
 * @param {import('telegraf').Context} ctx
 */
export async function exportCommand(ctx) {
  logger.info({ adminId: ctx.from?.id }, '/export buyrug\'i keldi');

  const participants = await getAllParticipants();

  if (participants.length === 0) {
    await ctx.reply("⚠️ Eksport qilish uchun ishtirokchilar yo'q.");
    return;
  }

  const csvContent = buildCsv(participants);
  const buffer = Buffer.from(csvContent, 'utf-8');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  await ctx.replyWithDocument(
    {
      source: buffer,
      filename: `ishtirokchilar-${timestamp}.csv`,
    },
    {
      caption: `📄 Jami <b>${participants.length}</b> ta ishtirokchi eksport qilindi.`,
      parse_mode: 'HTML',
    }
  );
}
