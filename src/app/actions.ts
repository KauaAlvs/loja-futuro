'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function enviarEmailBoasVindas(email: string, nome: string) {
  try {
    console.log(`Tentando enviar e-mail para: ${email}`)

    const { data, error } = await resend.emails.send({
      from: 'Loja Futuro <onboarding@resend.dev>', // Use este remetente para testes
      to: [email],
      subject: 'Bem-vindo à Loja Futuro!',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #000;">Olá, ${nome}!</h1>
          <p>Obrigado por se cadastrar na Loja Futuro.</p>
          <p>Seu cadastro foi realizado com sucesso durante o checkout.</p>
        </div>
      `,
    })

    if (error) {
      console.error('Erro no Resend:', error)
      return { success: false, error }
    }

    console.log('E-mail enviado com sucesso! ID:', data?.id)
    return { success: true, data }
    
  } catch (err) {
    console.error('Erro crítico no envio:', err)
    return { success: false, error: err }
  }
}