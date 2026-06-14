import { Queue } from 'bullmq'
import { env } from '@/config/env.js'

const connection = {
  host: 'relaxed-egret-101923.upstash.io',
  port: 6379,
  password: env.UPSTASH_REDIS_REST_TOKEN,
  tls: {},
}

export const emailQueue = new Queue('email', { connection })