import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  BOT_TOKEN:   z.string().min(1, 'BOT_TOKEN is required'),
  MONGODB_URI: z.string().url('MONGODB_URI must be a valid URI'),
  CHANNEL_ID:  z.string().min(1).optional(),

  // ADMIN_IDS endi ixtiyoriy — bo'sh qolishi mumkin.
  // Adminlar faqat DB orqali boshqariladi (SUPER_ADMIN qo'shadi/o'chiradi).
  ADMIN_IDS: z
    .string()
    .optional()
    .default('')
    .transform((val) =>
      val
        ? val.split(',').map((id) => id.trim()).filter(Boolean)
        : []
    ),

  // SUPER_ADMIN — yagona statik ma'mur, hech qachon o'zgarmas.
  SUPER_ADMIN: z.string().min(1, 'SUPER_ADMIN is required'),

  NODE_ENV: z.enum(['development', 'production']).default('development'),
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
