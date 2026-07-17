import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema(
  {
    channelId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Channel = mongoose.model('Channel', channelSchema);
