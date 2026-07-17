import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * Connects to MongoDB. Retries once if the initial connection fails.
 * Emits relevant lifecycle events to the logger.
 */
export async function connectDatabase() {
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });

  try {
    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (err) {
    logger.fatal({ err }, 'Failed to connect to MongoDB. Exiting.');
    process.exit(1);
  }
}

/**
 * Gracefully closes the MongoDB connection.
 */
export async function disconnectDatabase() {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
}
