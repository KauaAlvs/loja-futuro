import { ScrollText } from "lucide-react";

export default function TermsPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-4 bg-black text-white">
            <div className="container mx-auto max-w-4xl">

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-gray-800 rounded-xl">
                        <ScrollText className="text-cyan-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Termos de Uso</h1>
                        <p className="text-gray-400 text-sm">Última atualização: Fevereiro de 2026</p>
                    </div>
                </div>

                <div className="space-y-8 text-gray-300 leading-relaxed bg-gray-900/30 p-8 rounded-3xl border border-gray-800">

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Aceitação dos Termos</h2>
                        <p>
                            Ao acessar e usar a Future Store, você concorda com estes termos. Se você não concordar com qualquer parte,
                            por favor, não use nossos serviços.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. Uso do Site</h2>
                        <p>
                            Você concorda em usar nosso site apenas para fins legais e de maneira que não infrinja os direitos de terceiros,
                            nem restrinja ou iniba o uso e aproveitamento do site por qualquer outra pessoa.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. Produtos e Preços</h2>
                        <p>
                            Nos esforçamos para exibir com precisão as cores e imagens de nossos produtos. No entanto, não podemos garantir
                            que a exibição no monitor do seu computador seja exata. Reservamo-nos o direito de limitar as vendas de nossos
                            produtos a qualquer pessoa ou região geográfica.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Alterações</h2>
                        <p>
                            Podemos atualizar estes termos periodicamente. Recomendamos que você revise esta página regularmente para estar
                            ciente de quaisquer alterações.
                        </p>
                    </section>

                </div>
            </div>
        </main>
    );
}