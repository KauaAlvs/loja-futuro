import { Hammer, Clock } from "lucide-react";

export default function MaintenancePage() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">

            {/* Background Effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black z-0 pointer-events-none"></div>

            <div className="z-10 max-w-md bg-gray-900/50 border border-gray-800 p-10 rounded-3xl backdrop-blur-xl shadow-2xl">
                <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Hammer size={40} className="text-cyan-400" />
                </div>

                <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                    Estamos em Manutenção
                </h1>

                <p className="text-gray-400 mb-8">
                    Nossa loja está passando por melhorias rápidas para te atender melhor.
                    Voltaremos em alguns instantes! 🚀
                </p>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-mono bg-black/40 py-2 px-4 rounded-full w-fit mx-auto border border-gray-800">
                    <Clock size={12} /> Atualizando sistema...
                </div>
            </div>
        </main>
    );
}