export function Navbar() {
  return (
    <header className="bg-card border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold tracking-tight">Sistema de Tickets</span>
          <nav className="flex items-center gap-4">
            <span className="text-primary border-primary cursor-pointer border-b-2 pb-1 text-sm font-medium">
              Usuarios
            </span>
          </nav>
        </div>
      </div>
    </header>
  );
}
