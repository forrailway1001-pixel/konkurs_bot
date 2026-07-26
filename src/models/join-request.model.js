import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    channelId: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Bitta foydalanuvchi bitta kanalga faqat bitta so'rov yubora oladi
joinRequestSchema.index({ userId: 1, channelId: 1 }, { unique: true });

export const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);
