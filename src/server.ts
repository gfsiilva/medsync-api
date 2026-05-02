import 'dotenv/config'
import { buildApp } from './app.js'
import { env } from '@/config/env.js'
import { prisma } from '@/config/database.js'

async function main() {
  // Teste de conexão com o banco
  await prisma.$connect()
  console.log('✅ Banco de dados conectado!')

  const app = buildApp()

  try {
    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    })

    console.log(`🚀 MedSync API rodando na porta ${env.PORT}`)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  console.log('SIGTERM recebido - encerrando graciosamente...')
  process.exit(0)
})

main()