import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();
    const { cep } = body;

    if (!cep || cep.length < 8) {
        return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
    }

    // --- LÓGICA DE SIMULAÇÃO (Fingindo ser os Correios) ---
    // Na vida real, aqui você chamaria a API do Melhor Envio/Frenet/Correios

    const cepPrefix = parseInt(cep.substring(0, 1));
    let basePrice = 0;
    let days = 0;

    // Regra fictícia baseada no primeiro dígito do CEP
    if (cepPrefix <= 2) {
        // SP e região (Mais barato)
        basePrice = 15.00;
        days = 2;
    } else if (cepPrefix <= 5) {
        // Sul e Sudeste (Médio)
        basePrice = 25.00;
        days = 5;
    } else {
        // Norte, Nordeste, Centro-Oeste (Mais caro)
        basePrice = 45.00;
        days = 10;
    }

    // Retorna opções de frete
    return NextResponse.json({
        options: [
            {
                id: 'pac',
                name: 'PAC (Econômico)',
                price: basePrice,
                days: days + 3, // PAC demora mais
                carrier: 'Correios'
            },
            {
                id: 'sedex',
                name: 'SEDEX (Expresso)',
                price: basePrice * 1.8, // SEDEX é mais caro
                days: Math.max(1, days - 2), // Chega mais rápido
                carrier: 'Correios'
            }
        ]
    });
}