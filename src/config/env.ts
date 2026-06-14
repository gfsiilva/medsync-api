import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({

NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
PORT: z.coerce.number().default(3333),

DATABASE_URL: z.string().refine((val) => URL.canParse(val),{
    message:'DATABASE_URL deve ser uma URL válida'
}),

UPSTASH_REDIS_REST_URL: z.string().url(),
UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ser no minimo 32 caracteres'),
JWT_EXPIRES_IN: z.string().default('7d'),
RESEND_API_KEY: z.string().min(1),
EMAIL_FROM: z.email(),

REDIS_URL: z.string().refine(
  (val) => val.startsWith('redis://') || val.startsWith('rediss://'),
  { message: 'Invalid string: must start with "redis://" or "rediss://"' }
).default('redis://localhost:6379'),

SENTRY_DSN: z.string().refine((val) => URL.canParse(val), {
  message: 'SENTRY_DSN deve ser uma URL válida'
}).optional(),

ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    console.error('❌ Variáveis de ambiente inválidas:')
    console.error(parsed.error.flatten().fieldErrors)
    process.exit(1)
}

export const env = parsed.data