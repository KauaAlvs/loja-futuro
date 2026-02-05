import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

// 1. Configura o Mercado Pago com o Token de Acesso (Teste ou Produção)
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || ""
});

// 2. Configura o Supabase Admin (Usa Service Role para ignorar RLS e atualizar o banco)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        // Captura os parâmetros da URL enviada pelo Mercado Pago
        const url = new URL(request.url);
        const id = url.searchParams.get("data.id") || url.searchParams.get("id");
        const type = url.searchParams.get("type");

        console.log(`📩 Webhook recebido - Tipo: ${type} | ID: ${id}`);

        // O Mercado Pago envia avisos sobre diversos recursos. Filtramos apenas para "payment"
        if (type !== "payment" || !id) {
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // 3. Busca os detalhes reais do pagamento no Mercado Pago usando o ID recebido
        const payment = new Payment(client);
        const paymentData = await payment.get({ id });

        // Extraímos as informações necessárias
        const orderId = paymentData.external_reference; // O ID do pedido que enviamos no checkout
        const status = paymentData.status;               // 'approved', 'pending', 'rejected', etc.
        const method = paymentData.payment_method_id;    // 'pix', 'master', 'visa', etc.

        // Dados de Parcelamento (Installments)
        const installments = paymentData.installments;
        const installmentAmount = paymentData.transaction_details?.installment_amount;

        console.log(`🔎 Processando Pedido #${orderId} - Status MP: ${status}`);

        // 4. Se o pagamento foi aprovado, atualizamos o banco de dados
        if (status === "approved" && orderId) {
            const { error } = await supabaseAdmin
                .from("orders")
                .update({
                    status: "paid",
                    payment_id: String(id),
                    payment_method: method,
                    installments: installments,           // Salva a quantidade de parcelas
                    installment_amount: installmentAmount  // Salva o valor de cada parcela
                })
                .eq("id", orderId);

            if (error) {
                console.error(`❌ Erro ao atualizar Banco de Dados:`, error.message);
                throw error;
            }

            console.log(`✅ Sucesso: Pedido #${orderId} marcado como PAGO.`);
        } else {
            console.log(`ℹ️ Pedido #${orderId} não foi aprovado ainda (Status: ${status}).`);
        }

        // Retornamos 200 para o Mercado Pago parar de tentar enviar essa notificação
        return NextResponse.json({ status: "ok" }, { status: 200 });

    } catch (error: any) {
        console.error("❌ Erro crítico no Webhook:", error.message);

        // Mesmo com erro, às vezes é bom retornar 200 se o erro for de lógica interna, 
        // para evitar que o Mercado Pago fique sobrecarregando sua API com retentativas.
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}