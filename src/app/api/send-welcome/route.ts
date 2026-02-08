import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    const data = await resend.emails.send({
      from: 'Loja Futuro <onboarding@resend.dev>', // No começo tem que usar esse e-mail de teste
      to: [email], // Só envia para o e-mail que você cadastrou no Resend por enquanto
      subject: 'Bem-vindo ao Futuro! 🚀',
      react: WelcomeEmail({ userFirstname: name }),
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}