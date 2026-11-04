import { BellRing, ImageUp, Ticket } from "lucide-react";

import { DESCRIPCION_SISTEMA, NOMBRE_SISTEMA } from "@/lib/marca";

const BENEFICIOS = [
  {
    Icono: Ticket,
    texto: "Crea tickets y sigue su estado sin salir de la aplicación.",
  },
  {
    Icono: ImageUp,
    texto: "Adjunta capturas y conversa con Soporte en el mismo hilo.",
  },
  {
    Icono: BellRing,
    texto: "Recibe un aviso cuando haya una solución lista para revisar.",
  },
];

export function MarcaLogin({ variante }: { variante: "panel" | "compacta" }) {
  if (variante === "compacta") {
    return (
      <div className="flex items-center gap-2.5 lg:hidden">
        <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
          <Ticket className="size-5" aria-hidden />
        </span>
        <p className="text-lg font-bold tracking-tight">{NOMBRE_SISTEMA}</p>
      </div>
    );
  }

  return (
    <aside className="from-primary via-primary to-primary/80 text-primary-foreground relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br p-12 lg:flex">
      <div className="absolute -top-24 -right-24 size-72 rounded-full bg-white/10" aria-hidden />
      <div className="absolute -bottom-32 -left-16 size-80 rounded-full bg-white/5" aria-hidden />

      <div className="relative flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
          <Ticket className="size-6" aria-hidden />
        </span>
        <p className="text-lg font-semibold tracking-tight">{NOMBRE_SISTEMA}</p>
      </div>

      <div className="relative space-y-6">
        <p className="max-w-md text-3xl font-semibold tracking-tight text-balance">
          {DESCRIPCION_SISTEMA}
        </p>

        <ul className="space-y-3 text-sm">
          {BENEFICIOS.map(({ Icono, texto }) => (
            <li key={texto} className="text-primary-foreground/90 flex items-start gap-3">
              <Icono className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{texto}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-primary-foreground/90 relative text-xs">
        Acceso restringido. Las cuentas las crea un administrador.
      </p>
    </aside>
  );
}
