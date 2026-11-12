import { Navbar } from "@/components/layout/navbar";
import { GestionUsuarios } from "@/components/usuarios/gestion-usuarios";
import { obtenerRoles } from "@/lib/server/roles";
import { requerirSesion } from "@/lib/server/sesion";
import { obtenerUsuarios, type FiltrosUsuarios } from "@/lib/server/usuarios";

export const instant = false;

export const metadata = {
  title: "Usuarios",
};

const ESTADOS = ["Activo", "Inactivo", "Baja"];

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string; buscar?: string; estado?: string }>;
}) {
  const { usuario } = await requerirSesion();

  if (usuario.rol !== "Administrador") {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <main id="contenido" className="container mx-auto max-w-6xl px-4 py-8">
          <h1 className="mb-2 text-2xl font-bold">Acceso restringido</h1>
          <p className="text-muted-foreground">Esta sección es solo para administradores.</p>
        </main>
      </div>
    );
  }

  const params = await searchParams;
  const pagina = Math.max(1, Number.parseInt(params.pagina ?? "1", 10) || 1);
  const buscar = (params.buscar ?? "").trim();
  const estado = ESTADOS.includes(params.estado ?? "") ? params.estado : undefined;

  const filtros: FiltrosUsuarios = { pagina, limite: 10 };
  if (buscar) filtros.buscar = buscar;
  if (estado) filtros.estado = estado;

  const [paginaUsuarios, roles] = await Promise.all([obtenerUsuarios(filtros), obtenerRoles()]);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main id="contenido" className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Gestión de usuarios</h1>
        <GestionUsuarios
          usuarios={paginaUsuarios.data}
          roles={roles}
          meta={paginaUsuarios.meta}
          filtros={{ buscar, estado: estado ?? "todos" }}
        />
      </main>
    </div>
  );
}
