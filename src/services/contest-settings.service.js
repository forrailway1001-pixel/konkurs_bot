import { ContestSettings } from '../models/contest-settings.model.js';

const SETTINGS_KEY = 'main';

/**
 * Sozlamalar hujjatini oladi yoki yaratadi (singleton).
 * @returns {Promise<object>}
 */
async function getOrCreateSettings() {
  let settings = await ContestSettings.findOne({ key: SETTINGS_KEY });
  if (!settings) {
    settings = await ContestSettings.create({ key: SETTINGS_KEY, endDate: null });
  }
  return settings;
}

/**
 * Konkurs tugash sanasini oladi.
 * @returns {Promise<Date|null>}
 */
export async function getContestEndDate() {
  const settings = await getOrCreateSettings();
  return settings.endDate;
}

/**
 * Konkurs tugash sanasini o'rnatadi.
 * @param {Date} date
 * @returns {Promise<void>}
 */
export async function setContestEndDate(date) {
  await ContestSettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { endDate: date },
    { upsert: true, new: true }
  );
}
