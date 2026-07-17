import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      default: null,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    ticketNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 500,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

export const Participant = mongoose.model('Participant', participantSchema);
