"use client";

import { usePathname } from "next/navigation";
import MaintenancePage from "@/app/maintenance/page";
import { Navbar } from "./Navbar"; // <--- Só a Navbar!
import { Footer } from "./Footer";

export function MaintenanceGuard({
    isMaintenance,
    children
}: {
    isMaintenance: boolean,
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");

    // 1. Bloqueio de Manutenção
    if (isMaintenance && !isAdmin) {
        return <MaintenancePage />;
    }

    // 2. Site Normal (Navbar Única + Conteúdo + Footer)
    return (
        <div className="min-h-screen flex flex-col bg-black">
            <Navbar />

            <main className="flex-1 pt-20"> {/* pt-20 compensa a altura da Navbar fixa */}
                {children}
            </main>

            {!isAdmin && <Footer />}
        </div>
    );
}