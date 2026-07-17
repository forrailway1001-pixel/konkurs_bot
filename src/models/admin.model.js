import mongoose from 'mongoose';

/**
 * Admin modeli — SUPER ADMIN tomonidan qo'shilgan adminlarni saqlaydi.
 * .env dagi ADMIN_IDS va SUPER_ADMIN bilan birga ishlatiladi.
 */
const adminSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    addedBy: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Admin = mongoose.model('Admin', adminSchema);
