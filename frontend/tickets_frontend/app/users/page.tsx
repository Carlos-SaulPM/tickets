import { Navbar } from "@/components/layout/navbar";
import { GestionUsuarios } from "@/components/usuarios/gestion-usuarios";
import { obtenerRoles } from "@/lib/server/roles";
import { requerirSesion } from "@/lib/server/sesion";
import { obtenerUsuarios } from "@/lib/server/usuarios";

export const instant = false;

export default async function UsuariosPage() {
  const { usuario } = await requerirSesion();

  if (usuario.rol !== "Administrador") {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <main id="contenido" className="container mx-auto px-4 py-8">
          <h1 className="mb-2 text-2xl font-bold">Acceso restringido</h1>
          <p className="text-muted-foreground">Esta sección es solo para administradores.</p>
        </main>
      </div>
    );
  }

  const [usuarios, roles] = await Promise.all([obtenerUsuarios(), obtenerRoles()]);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main id="contenido" className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Gestión de usuarios</h1>
        <GestionUsuarios usuarios={usuarios} roles={roles} />
      </main>
    </div>
  );
}
