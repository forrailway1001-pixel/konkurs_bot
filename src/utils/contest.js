/**
 * Konkurs tugash vaqti: 20-iyun 2026, soat 20:00 (Toshkent vaqti, UTC+5)
 * O'zgartirish uchun faqat shu konstantani yangilang.
 */
export const CONTEST_END_DATE = new Date("2026-07-20T15:00:00.000Z"); // 20:00 UTC+5

/**
 * Konkurs hali davom etayaptimi?
 * @returns {boolean}
 */
export function isContestActive() {
  return new Date() < CONTEST_END_DATE;
}

/**
 * Konkurs tugash vaqtini o'zbek tilida chiroyli ko'rsatadi.
 * @returns {string}  "20-iyun, soat 20:00"
 */
export function getContestEndLabel() {
  return "20-iyun, soat 20:00";
}
