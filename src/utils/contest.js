/**
 * Konkurs vaqti yordamchi funksiyalari.
 *
 * Endi tugash sanasi MongoDB da saqlanadi (ContestSettings).
 * Statik CONTEST_END_DATE o'rniga async funksiyalardan foydalaning.
 *
 * Foydalanish:
 *   import { isContestActiveAsync, getContestEndLabelAsync } from '../utils/contest.js';
 *   const active = await isContestActiveAsync();
 */

import { getContestEndDate } from '../services/contest-settings.service.js';

/**
 * Konkurs hali davom etayaptimi? (async — DB dan o'qiydi)
 * @returns {Promise<boolean>}
 */
export async function isContestActiveAsync() {
  const endDate = await getContestEndDate();
  if (!endDate) return true; // Tugash sanasi belgilanmagan → doim faol
  return new Date() < endDate;
}

/**
 * Konkurs tugash vaqtini o'zbek tilida chiroyli ko'rsatadi. (async)
 * @returns {Promise<string>}  masalan: "20-iyul, soat 20:00" yoki "belgilanmagan"
 */
export async function getContestEndLabelAsync() {
  const endDate = await getContestEndDate();
  if (!endDate) return 'belgilanmagan';

  const months = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
  ];

  // Toshkent vaqti (UTC+5)
  const tashkent = new Date(endDate.getTime() + 5 * 60 * 60 * 1000);
  const day   = tashkent.getUTCDate();
  const month = months[tashkent.getUTCMonth()];
  const hours = String(tashkent.getUTCHours()).padStart(2, '0');
  const mins  = String(tashkent.getUTCMinutes()).padStart(2, '0');

  return `${day}-${month}, soat ${hours}:${mins}`;
}

// ─── Eski sinxron API (Backward compat, olib tashlanishi mumkin) ──────────────
// Agar eskilik saqlanishi kerak bo'lsa, bu qismi qoladi.
// Ammo endi fayllar async versiyadan foydalanishi kerak.
export const CONTEST_END_DATE = null;
export function isContestActive() { return true; }
export function getContestEndLabel() { return 'belgilanmagan'; }
