export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="min-h-screen">
            {/* NÃO coloque <Navbar /> ou <Header /> aqui.
          O RootLayout -> MaintenanceGuard já está cuidando disso.
      */}
            {children}
        </section>
    );
}