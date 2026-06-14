import { Worker } from 'bullmq'
import { Resend } from 'resend'
import { env } from '@/config/env.js'

const connection = {
  host: 'relaxed-egret-101923.upstash.io',
  port: 6379,
  password: env.UPSTASH_REDIS_REST_TOKEN,
  tls: {},
}

const resend = new Resend(env.RESEND_API_KEY)

export const emailWorker = new Worker(
  'email',
  async (job) => {
    const { to, patientName, doctorName, date } = job.data

    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: '✅ Consulta confirmada — MedSync',
      html: `
        <h2>Olá, ${patientName}!</h2>
        <p>Sua consulta com o Dr(a). <strong>${doctorName}</strong> foi confirmada.</p>
        <p><strong>Data:</strong> ${new Date(date).toLocaleString('pt-BR')}</p>
        <p>Em caso de dúvidas, entre em contato conosco.</p>
        <br/>
        <p>— Equipe MedSync</p>
      `,
    })

    console.log(`✅ Email enviado para ${to}`)
  },
  { connection },
)

emailWorker.on('completed', (job) => {
  console.log(`📧 Job ${job.id} concluído`)
})

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} falhou:`, err.message)
})