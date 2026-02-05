"use client";

import { RefreshCw, AlertCircle, CheckCircle, Clock, Truck, CreditCard } from "lucide-react";

export default function ReturnsPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-4 bg-black text-white">
            <div className="container mx-auto max-w-4xl">

                {/* HEADER */}
                <div className="mb-10 text-center md:text-left">
                    <div className="inline-flex items-center justify-center p-4 bg-purple-900/20 rounded-2xl mb-6 border border-purple-500/30">
                        <RefreshCw className="text-purple-400" size={40} />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">Trocas e Devoluções</h1>
                    <p className="text-gray-400">
                        Queremos que você ame sua compra. Se algo deu errado, resolvemos rápido para você.
                    </p>
                </div>

                {/* CARDS DE RESUMO */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 hover:border-cyan-500/50 transition-colors">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Clock className="text-cyan-400" /> Arrependimento
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Não gostou ou mudou de ideia? Você tem até <strong>7 dias corridos</strong> após o recebimento para devolver sem custo.
                        </p>
                        <span className="text-xs bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded border border-cyan-500/30">Lei do Consumidor (Art. 49)</span>
                    </div>

                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-colors">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <AlertCircle className="text-purple-400" /> Defeito de Fábrica
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            O produto apresentou falha? Você tem <strong>30 dias</strong> (bens não duráveis) ou <strong>90 dias</strong> (duráveis) de garantia.
                        </p>
                        <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded border border-purple-500/30">Garantia Legal</span>
                    </div>
                </div>

                {/* PASSO A PASSO */}
                <div className="space-y-12 text-gray-300 bg-gray-900/30 p-8 md:p-12 rounded-3xl border border-gray-800">

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6">Como solicitar uma troca?</h2>
                        <div className="space-y-6">

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-black border border-gray-700 flex items-center justify-center font-bold text-white flex-shrink-0">1</div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Entre em contato</h4>
                                    <p>Envie um e-mail para nosso suporte ou chame no WhatsApp informando o número do pedido e o motivo da troca. Se for defeito, envie fotos/vídeos.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-black border border-gray-700 flex items-center justify-center font-bold text-white flex-shrink-0">2</div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Código de Postagem (Logística Reversa)</h4>
                                    <p>Nós geramos um código dos Correios para você. Basta levar o produto embalado até uma agência. <strong>O frete da primeira devolução é por nossa conta.</strong></p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-black border border-gray-700 flex items-center justify-center font-bold text-white flex-shrink-0">3</div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Análise e Reembolso</h4>
                                    <p>Assim que o produto chegar, faremos uma análise de qualidade em até 3 dias úteis. Estando tudo certo, prosseguimos com a troca ou estorno.</p>
                                </div>
                            </div>

                        </div>
                    </section>

                    <hr className="border-gray-800" />

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white mb-4">Condições para Devolução</h2>
                        <ul className="grid gap-3">
                            <li className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-gray-700/50">
                                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                                <span>O produto deve estar na embalagem original.</span>
                            </li>
                            <li className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-gray-700/50">
                                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                                <span>Sem indícios de uso, manchas ou odores (para arrependimento).</span>
                            </li>
                            <li className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-gray-700/50">
                                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                                <span>Acompanhado de nota fiscal, manual e todos os acessórios.</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <CreditCard className="text-cyan-400" /> Formas de Reembolso
                        </h2>
                        <p className="mb-4">
                            Se optar pelo cancelamento da compra, a devolução do valor ocorre na mesma forma de pagamento original:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-800/50 rounded-xl">
                                <h5 className="font-bold text-white mb-1">Cartão de Crédito</h5>
                                <p className="text-xs text-gray-400">O estorno é solicitado à operadora e pode aparecer em até 2 faturas subsequentes.</p>
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-xl">
                                <h5 className="font-bold text-white mb-1">PIX ou Boleto</h5>
                                <p className="text-xs text-gray-400">O reembolso é feito via transferência bancária ou PIX na conta do titular da compra em até 3 dias úteis.</p>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </main>
    );
}