"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

export default function FAQPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-4 bg-black text-white">
            <div className="container mx-auto max-w-3xl">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <HelpCircle className="text-cyan-400" /> Perguntas Frequentes
                </h1>
                <p className="text-gray-400 mb-10">Tire suas dúvidas sobre compras, envios e produtos.</p>

                <div className="space-y-4">
                    <Accordion title="Qual o prazo de entrega?">
                        O prazo varia de acordo com o seu CEP e a modalidade escolhida (PAC ou SEDEX).
                        Você pode simular o prazo exato na página do produto ou no carrinho antes de finalizar a compra.
                    </Accordion>

                    <Accordion title="Quais as formas de pagamento?">
                        Aceitamos cartão de crédito em até 12x, PIX com aprovação imediata e boleto bancário (aprovação em até 2 dias úteis).
                    </Accordion>

                    <Accordion title="O site é seguro?">
                        Sim! Utilizamos criptografia SSL de ponta a ponta para proteger seus dados.
                        Não armazenamos números de cartão de crédito e nossos pagamentos são processados por gateways certificados.
                    </Accordion>

                    <Accordion title="Como funciona a troca?">
                        Você tem até 7 dias corridos após o recebimento para solicitar a troca ou devolução por arrependimento,
                        conforme o Código de Defesa do Consumidor. O produto deve estar sem uso e na embalagem original.
                    </Accordion>
                </div>
            </div>
        </main>
    );
}

// Componente Interno de Accordion
function Accordion({ title, children }: { title: string, children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-gray-800 rounded-xl bg-gray-900/30 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-5 text-left hover:bg-white/5 transition-colors"
            >
                <span className="font-bold text-lg">{title}</span>
                {isOpen ? <ChevronUp className="text-cyan-400" /> : <ChevronDown className="text-gray-500" />}
            </button>
            {isOpen && (
                <div className="p-5 pt-0 text-gray-400 leading-relaxed border-t border-gray-800/50">
                    {children}
                </div>
            )}
        </div>
    );
}