import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render'; // <--- Importação nova

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    console.log("1. Iniciando envio para:", email);

    // 1. Transformamos o componente React em HTML (Texto) manualmente
    // Isso evita que o Resend tente fazer isso e falhe
    const emailHtml = await render(WelcomeEmail({ userFirstname: name || 'Visitante' }));

    console.log("2. HTML gerado com sucesso!");

    // 2. Enviamos o HTML pronto
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Modo Grátis: Só pode usar este remetente
      to: [email],                   // Modo Grátis: Só pode enviar para o SEU email
      subject: 'Bem-vindo ao Futuro! 🚀',
      html: emailHtml,               // <--- Mudamos de 'react' para 'html'
    });

    if (error) {
      console.error("❌ Erro do Resend:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    console.log("✅ Sucesso:", data);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("❌ Erro no Servidor:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}