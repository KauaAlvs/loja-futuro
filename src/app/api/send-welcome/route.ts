import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    // --- TRAVA DE SEGURANÇA ---
    // Verifica se o email veio vazio ou inválido
    if (!email || !email.includes('@')) {
        console.error("❌ Tentativa de envio sem email válido:", email);
        return NextResponse.json(
            { error: "Por favor, digite um e-mail válido no campo." },
            { status: 400 }
        );
    }

    console.log("1. Preparando envio para:", email);

    // Renderiza o HTML manualmente
    const emailHtml = await render(WelcomeEmail({ userFirstname: name || 'Visitante' }));

    // Envia
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // OBRIGATÓRIO no modo grátis
      to: email,                     // OBRIGATÓRIO ser seu email de cadastro
      subject: 'Bem-vindo ao Futuro! 🚀',
      html: emailHtml,
    });

    if (error) {
      console.error("❌ Erro retornado pelo Resend:", error);
      return NextResponse.json({ error }, { status: 422 });
    }

    console.log("✅ E-mail enviado com sucesso:", data);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("❌ Erro interno:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}