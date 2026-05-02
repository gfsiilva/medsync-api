import fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { env } from '@/config/env.js'
import { en } from 'zod/v4/locales'

export function buildApp () {

    const app = fastify({
        logger: {
            transport: env.NODE_ENV === 'development'
            ? { target: 'pino-pretty', options: {colorize: true} }
            : undefined,
        },
    })

// SEGURANÇA

app.register(helmet)
app.register(cors,{
    origin:env.ALLOWED_ORIGINS.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})

//ROTAS D. SAÚDE

app.get('/health', async() =>{
    return { status: 'ok', timestamp: new Date().toISOString()}
})

return app

}