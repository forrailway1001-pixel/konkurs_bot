import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema(
  {
    channelId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userIds: {
      type: [Number],
      default: [],
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);
