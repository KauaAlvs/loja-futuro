"use client";

import { ShieldCheck, Lock, Server, Eye, FileText } from "lucide-react";

export default function PrivacyPage() {
    // Data dinâmica para parecer sempre atualizado
    const currentDate = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    return (
        <main className="min-h-screen pt-32 pb-20 px-4 bg-black text-white">
            <div className="container mx-auto max-w-4xl">

                {/* HEADER */}
                <div className="mb-10 text-center md:text-left">
                    <div className="inline-flex items-center justify-center p-4 bg-cyan-900/20 rounded-2xl mb-6 border border-cyan-500/30">
                        <ShieldCheck className="text-cyan-400" size={40} />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">Política de Privacidade</h1>
                    <p className="text-gray-400">
                        Sua segurança é nossa prioridade absoluta. Entenda como cuidamos dos seus dados.
                        <br />
                        <span className="text-cyan-400 text-sm font-bold mt-2 block">
                            Última atualização: {currentDate}
                        </span>
                    </p>
                </div>

                {/* CONTEÚDO */}
                <div className="space-y-8 text-gray-300 leading-relaxed bg-gray-900/30 p-8 md:p-12 rounded-3xl border border-gray-800 shadow-2xl">

                    <p className="text-lg text-white font-medium">
                        Na <strong>Future Store</strong>, levamos a sério a proteção dos seus dados pessoais.
                        Esta política descreve como coletamos, usamos e protegemos suas informações ao visitar nosso site,
                        em conformidade com a Lei Geral de Proteção de Dados (LGPD).
                    </p>

                    <hr className="border-gray-800" />

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText size={20} className="text-purple-400" /> 1. Quais dados coletamos?
                        </h2>
                        <p>Coletamos apenas as informações essenciais para processar seus pedidos e melhorar sua experiência:</p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
                            <li><strong>Dados Pessoais:</strong> Nome completo, CPF (para emissão de Nota Fiscal), e-mail e telefone/WhatsApp.</li>
                            <li><strong>Dados de Entrega:</strong> Endereço completo, CEP e complementos.</li>
                            <li><strong>Dados de Pagamento:</strong> Informações de cartão de crédito são processadas diretamente pelo gateway de pagamento (ex: Mercado Pago/Stripe) via conexão criptografada. <strong>Nós NÃO armazenamos os números do seu cartão.</strong></li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Server size={20} className="text-purple-400" /> 2. Como usamos seus dados?
                        </h2>
                        <p>Seus dados têm destinos específicos e transparentes:</p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
                            <li><strong>Processamento de Pedidos:</strong> Para enviar os produtos até sua casa e emitir a NF-e.</li>
                            <li><strong>Comunicação:</strong> Para enviar o código de rastreio e atualizações sobre o status da entrega.</li>
                            <li><strong>Suporte:</strong> Para identificar sua compra caso você precise de ajuda ou trocas.</li>
                            <li><strong>Segurança:</strong> Para análise antifraude, protegendo você e a loja de transações suspeitas.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Lock size={20} className="text-purple-400" /> 3. Segurança e Proteção (SSL)
                        </h2>
                        <div className="bg-black/40 p-4 rounded-xl border border-gray-700/50 flex gap-4">
                            <Lock className="text-green-400 flex-shrink-0" size={24} />
                            <p className="text-sm">
                                Todo o tráfego de dados no nosso site é criptografado utilizando a tecnologia <strong>SSL (Secure Socket Layer)</strong> de 256 bits. Isso significa que ninguém consegue interceptar seus dados enquanto você navega ou realiza uma compra.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Eye size={20} className="text-purple-400" /> 4. Compartilhamento de Dados
                        </h2>
                        <p>Nós <strong>nunca vendemos</strong> seus dados pessoais. Compartilhamos apenas o estritamente necessário com parceiros logísticos:</p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
                            <li><strong>Transportadoras/Correios:</strong> Para que eles saibam onde entregar seu pacote.</li>
                            <li><strong>Processadores de Pagamento:</strong> Para aprovar sua transação com segurança.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShieldCheck size={20} className="text-purple-400" /> 5. Seus Direitos (LGPD)
                        </h2>
                        <p>Você tem total controle sobre suas informações. A qualquer momento, você pode:</p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
                            <li>Solicitar acesso aos dados que temos sobre você.</li>
                            <li>Solicitar a correção de dados incompletos ou errados.</li>
                            <li>Solicitar a exclusão dos seus dados (exceto os necessários para cumprimento fiscal/legal).</li>
                        </ul>
                        <p className="mt-4 text-sm bg-cyan-900/10 p-3 rounded-lg border border-cyan-500/20 text-cyan-200">
                            Para exercer seus direitos, entre em contato com nosso Encarregado de Dados (DPO) através do e-mail de suporte disponível no rodapé.
                        </p>
                    </section>

                </div>
            </div>
        </main>
    );
}