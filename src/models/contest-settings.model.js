import mongoose from 'mongoose';

/**
 * Konkurs sozlamalari modeli — tugash vaqti va boshqa global sozlamalar.
 * Yagona hujjat saqlanadi (singleton pattern).
 */
const contestSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'main',
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

export const ContestSettings = mongoose.model('ContestSettings', contestSettingsSchema);
