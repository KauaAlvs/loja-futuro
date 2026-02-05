import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@supabase/supabase-js";
// Importamos o Guardião que cuida de toda a estrutura (Nav, Footer, Bloqueio)
import { MaintenanceGuard } from "@/components/MaintenanceGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Future Store",
  description: "A loja do futuro.",
};

// Configuração do Supabase para o Servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // 1. Busca Configuração de Manutenção (Server-Side)
  // Isso acontece no servidor antes de enviar qualquer HTML para o usuário
  let isMaintenance = false;

  try {
    const { data: settings } = await supabase
      .from('store_settings')
      .select('is_maintenance')
      .single();

    if (settings) {
      isMaintenance = settings.is_maintenance;
    }
  } catch (error) {
    console.error("Erro ao buscar configurações da loja:", error);
  }

  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${inter.className} bg-black text-white antialiased`}>

        {/* O MaintenanceGuard recebe o estado e decide:
           1. Se for Admin -> Renderiza normal (sem Nav/Footer pois Admin tem o dele)
           2. Se for Cliente e Manutenção ON -> Mostra tela de bloqueio
           3. Se for Cliente e Manutenção OFF -> Mostra Site + Nav + Footer
        */}
        <MaintenanceGuard isMaintenance={isMaintenance}>
          {children}
        </MaintenanceGuard>

      </body>
    </html>
  );
}