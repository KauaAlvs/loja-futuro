import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

// 1. Configuração do Cliente Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || ""
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // ADICIONADO: discountAmount capturado do body
        const { items, orderId, customerEmail, shippingCost, shippingName, discountAmount } = body;

        // 2. Limpeza da URL Base
        let baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
        baseUrl = baseUrl.replace(/\/+$/, "");

        console.log("🚀 Gerando preferência para o pedido:", orderId);

        const preference = new Preference(client);

        // 3. Montagem da lista de itens (Produtos)
        const formattedItems = items.map((item: any) => ({
            id: String(item.id),
            title: String(item.name),
            unit_price: Number(item.price),
            quantity: Number(item.quantity),
            currency_id: "BRL",
        }));

        // 4. ADIÇÃO DO FRETE
        if (shippingCost > 0) {
            formattedItems.push({
                id: "shipt-001",
                title: `Frete: ${shippingName || 'Envio'}`,
                unit_price: Number(shippingCost),
                quantity: 1,
                currency_id: "BRL",
            });
        }

        // 5. ADIÇÃO DO DESCONTO (O segredo está no valor negativo)
        if (discountAmount && Number(discountAmount) > 0) {
            formattedItems.push({
                id: "discount-001",
                title: `Cupom de Desconto Aplicado`,
                unit_price: -Number(discountAmount), // <--- VALOR NEGATIVO AQUI
                quantity: 1,
                currency_id: "BRL",
            });
        }

        // 6. Criação da Preferência no Mercado Pago
        const response = await preference.create({
            body: {
                items: formattedItems,
                payer: {
                    email: customerEmail
                },
                back_urls: {
                    success: `${baseUrl}/checkout/success`,
                    failure: `${baseUrl}/checkout/error`,
                    pending: `${baseUrl}/checkout/pending`,
                },
                notification_url: `${baseUrl}/api/webhooks/mercadopago`,
                external_reference: String(orderId),
                payment_methods: {
                    installments: 12,
                    excluded_payment_types: [],
                }
            },
        });

        // 7. RETORNO: Link para o checkout
        return NextResponse.json({ init_point: response.init_point });

    } catch (error: any) {
        console.error("❌ ERRO API CHECKOUT:", error.message);
        return NextResponse.json(
            { error: "Erro ao gerar link de pagamento", details: error.message },
            { status: 500 }
        );
    }
}