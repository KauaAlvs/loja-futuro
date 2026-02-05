"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";
import Link from "next/link";

export function Footer() {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        // Busca as configs ao carregar o rodapé
        async function loadSettings() {
            const { data } = await supabase.from('store_settings').select('*').single();
            if (data) setSettings(data);
        }
        loadSettings();
    }, []);

    // Se ainda não carregou, mostra um esqueleto ou dados padrão
    const config = settings || {
        store_name: "Future Store",
        support_email: "contato@loja.com",
        phone: "Carregando...",
        address: "Brasil"
    };

    return (
        <footer className="bg-black border-t border-gray-900 pt-16 pb-8 text-gray-400 text-sm">
            <div className="container mx-auto px-4">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    {/* 1. MARCA E SOBRE */}
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4 tracking-tighter">
                            {config.store_name.split(' ')[0]}<span className="text-cyan-400">{config.store_name.split(' ')[1] || ''}</span>
                        </h3>
                        <p className="mb-6">
                            A loja do futuro, trazendo inovação e estilo para o seu dia a dia com a melhor tecnologia do mercado.
                        </p>
                        <div className="flex gap-4">
                            {config.instagram_url && (
                                <a href={config.instagram_url} target="_blank" className="p-2 bg-gray-900 rounded-full hover:bg-cyan-500 hover:text-white transition-all">
                                    <Instagram size={18} />
                                </a>
                            )}
                            <a href="#" className="p-2 bg-gray-900 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                                <Facebook size={18} />
                            </a>
                        </div>
                    </div>

                    {/* 2. LINKS RÁPIDOS */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Navegação</h4>
                        <ul className="space-y-3">
                            <li><Link href="/" className="hover:text-cyan-400 transition-colors">Início</Link></li>
                            <li><Link href="/category/1" className="hover:text-cyan-400 transition-colors">Calçados</Link></li>
                            <li><Link href="/category/2" className="hover:text-cyan-400 transition-colors">Eletrônicos</Link></li>
                            <li><Link href="/track" className="hover:text-cyan-400 transition-colors">Rastrear Pedido</Link></li>
                        </ul>
                    </div>

                    {/* 3. AJUDA */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Ajuda</h4>
                        <ul className="space-y-3">
                            <li><Link href="/faq" className="hover:text-cyan-400 transition-colors">Perguntas Frequentes</Link></li>
                            <li><Link href="/returns" className="hover:text-cyan-400 transition-colors">Trocas e Devoluções</Link></li>
                            <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Política de Privacidade</Link></li>
                            <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Termos de Uso</Link></li>
                        </ul>
                    </div>

                    {/* 4. CONTATO (DINÂMICO) */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Fale Conosco</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                                <span>{config.address}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-cyan-400 flex-shrink-0" />
                                <a href={`mailto:${config.support_email}`} className="hover:text-white transition-colors">{config.support_email}</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-cyan-400 flex-shrink-0" />
                                <a href={`https://wa.me/${config.phone.replace(/\D/g, '')}`} target="_blank" className="hover:text-white transition-colors">
                                    {config.phone}
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>&copy; {new Date().getFullYear()} {config.store_name}. Todos os direitos reservados.</p>
                    <div className="flex items-center gap-2 opacity-50">
                        <span className="text-xs">Larguinha dev</span>
                        {/* Ícones de pagamento svg ou imagens aqui */}
                    </div>
                </div>
            </div>
        </footer>
    );
}