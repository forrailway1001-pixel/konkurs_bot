import { Admin } from '../models/admin.model.js';
import { config } from '../config/index.js';

/**
 * Foydalanuvchi admin ekanligini tekshiradi.
 * Admin = SUPER_ADMIN | DB dagi dinamik adminlar.
 * @param {string|number} userId
 * @returns {Promise<boolean>}
 */
export async function isAdmin(userId) {
  const strId = String(userId);

  // SUPER_ADMIN doim admin
  if (strId === config.SUPER_ADMIN) return true;

  // DB dagi dinamik adminlar
  const found = await Admin.findOne({ userId: strId });
  return !!found;
}

/**
 * Barcha dinamik adminlar ro'yxatini oladi (DB dagi).
 * @returns {Promise<Array>}
 */
export async function getAllDynamicAdmins() {
  return Admin.find().sort({ createdAt: 1 }).lean();
}

/**
 * Yangi admin qo'shadi.
 * @param {string} userId
 * @param {string} addedBy — qo'shgan SUPER_ADMIN ID si
 * @param {string|null} note — ixtiyoriy izoh
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function addAdmin(userId, addedBy, note = null) {
  const strId = String(userId);

  if (strId === config.SUPER_ADMIN) {
    return { success: false, message: 'Bu foydalanuvchi allaqachon SUPER ADMIN.' };
  }

  const existing = await Admin.findOne({ userId: strId });
  if (existing) {
    return { success: false, message: 'Bu foydalanuvchi allaqachon admin.' };
  }

  await Admin.create({ userId: strId, addedBy: String(addedBy), note });
  return { success: true };
}

/**
 * Adminni o'chiradi.
 * @param {string} userId
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function removeAdmin(userId) {
  const strId = String(userId);

  if (strId === config.SUPER_ADMIN) {
    return { success: false, message: 'SUPER ADMIN o\'chirilmaydi.' };
  }

  const result = await Admin.deleteOne({ userId: strId });
  if (result.deletedCount === 0) {
    return { success: false, message: 'Bu foydalanuvchi adminlar ro\'yxatida topilmadi.' };
  }
  return { success: true };
}
