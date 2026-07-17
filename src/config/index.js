import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  BOT_TOKEN: z.string().min(1, 'BOT_TOKEN is required'),
  MONGODB_URI: z.string().url('MONGODB_URI must be a valid URI'),
  CHANNEL_ID: z.string().min(1, 'CHANNEL_ID is required'),
  ADMIN_IDS: z
    .string()
    .min(1, 'ADMIN_IDS is required')
    .transform((val) => val.split(',').map((id) => id.trim())),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:');
  parsed.error.issues.forEach((issue) => {
    console.error(`   • ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const config = parsed.data;
