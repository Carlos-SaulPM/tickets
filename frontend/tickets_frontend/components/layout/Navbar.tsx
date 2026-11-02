import Link from "next/link"; // o react-router-dom

export function Navbar() {
  return (
    <header className="bg-background border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold">System Dashboard</span>
          <nav className="flex items-center gap-4">
            <Link
              href="/users"
              className="hover:text-primary text-sm font-medium transition-colors"
            >
              Usuarios
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
