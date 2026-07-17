import { Participant } from '../models/participant.model.js';

/**
 * Finds a participant by their Telegram userId.
 * @param {number} userId
 * @returns {Promise<import('../models/participant.model.js').Participant | null>}
 */
export async function findParticipantByUserId(userId) {
  return Participant.findOne({ userId });
}

/**
 * Keyingi unikal tiket raqamini qaytaradi.
 * Eng katta raqamni topib, unga +1 qo'shadi.
 *
 * @returns {Promise<number>}
 */
async function nextTicketNumber() {
  const last = await Participant.findOne().sort({ ticketNumber: -1 }).lean();
  return last ? last.ticketNumber + 1 : 1;
}

/**
 * Ishtirokchini ro'yxatdan o'tkazadi.
 * - Allaqachon ro'yxatda bo'lsa → mavjud yozuvni qaytaradi.
 * - Yangi bo'lsa → keyingi ketma-ket raqamni beradi va saqlaydi.
 *
 * @param {{ userId: number, username: string | null, firstName: string, ticketNumber?: number }} userData
 * @returns {Promise<{ participant: object, isNew: boolean, error?: string }>}
 */
export async function registerParticipant(userData) {
  const existing = await findParticipantByUserId(userData.userId);
  if (existing) {
    return { participant: existing, isNew: false };
  }

  // Agar qo'lda raqam kiritilgan bo'lsa, u band yoki yo'qligini tekshirish
  if (userData.ticketNumber !== undefined) {
    const taken = await Participant.findOne({ ticketNumber: userData.ticketNumber });
    if (taken) {
      return { isNew: false, error: 'Bu raqam allaqachon band qilingan' };
    }
  }

  const ticketNumber = userData.ticketNumber !== undefined 
    ? userData.ticketNumber 
    : await nextTicketNumber();

  const participant = await Participant.create({
    userId: userData.userId,
    username: userData.username ?? null,
    firstName: userData.firstName,
    ticketNumber,
  });

  return { participant, isNew: true };
}

/**
 * Konkurs statistikasini qaytaradi.
 * @returns {Promise<{ total: number }>}
 */
export async function getContestStats() {
  const total = await Participant.countDocuments();
  return { total };
}

/**
 * Picks one random participant from the database to be the winner.
 * @returns {Promise<object | null>}
 */
export async function pickWinner() {
  const count = await Participant.countDocuments();
  if (count === 0) return null;

  const randomSkip = Math.floor(Math.random() * count);
  return Participant.findOne().skip(randomSkip).lean();
}

/**
 * Returns all participants sorted by ticketNumber ascending.
 * @returns {Promise<object[]>}
 */
export async function getAllParticipants() {
  return Participant.find().sort({ ticketNumber: 1 }).lean();
}

/**
 * Deletes all participants. Use with caution — irreversible.
 * @returns {Promise<number>} Number of deleted documents.
 */
export async function resetAllParticipants() {
  const result = await Participant.deleteMany({});
  return result.deletedCount;
}
