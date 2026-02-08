import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    console.log("1. Iniciando envio...");
    console.log("2. API Key configurada?", !!process.env.RESEND_API_KEY); // Vai mostrar true ou false no log
    console.log("3. Enviando para:", email);

    // O Resend retorna um objeto { data, error }
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // OBRIGATÓRIO: Use exatamente este email no modo grátis
      to: [email], // OBRIGATÓRIO: Tem que ser o SEU email de cadastro no Resend
      subject: 'Bem-vindo ao Futuro! 🚀',
      react: WelcomeEmail({ userFirstname: name || 'Cliente' }),
    });

    if (error) {
      console.error("❌ Erro retornado pelo Resend:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    console.log("✅ Sucesso:", data);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("❌ Erro interno do servidor:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}