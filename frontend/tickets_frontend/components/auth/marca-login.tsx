import { Ticket } from "lucide-react";

import { DESCRIPCION_SISTEMA, NOMBRE_SISTEMA } from "@/lib/marca";

const ESTADOS = [
  { etiqueta: "Abierto", punto: "bg-sky-500" },
  { etiqueta: "En proceso", punto: "bg-amber-500" },
  { etiqueta: "En revisión", punto: "bg-violet-500" },
  { etiqueta: "Cerrado", punto: "bg-slate-400" },
];

export function MarcaLogin({ variante }: { variante: "panel" | "compacta" }) {
  if (variante === "compacta") {
    return (
      <div className="space-y-1 lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
            <Ticket className="size-5" aria-hidden />
          </span>
          <p className="text-lg font-bold tracking-tight">{NOMBRE_SISTEMA}</p>
        </div>
        <p className="text-muted-foreground text-sm">{DESCRIPCION_SISTEMA}</p>
      </div>
    );
  }

  return (
    <aside className="bg-secondary/40 fondo-puntos relative hidden flex-col justify-between overflow-hidden border-r p-8 pb-16 lg:flex">
      <Ticket
        className="text-primary/[0.04] pointer-events-none absolute -right-8 bottom-10 size-64 rotate-12"
        aria-hidden
      />

      <div className="relative flex items-center gap-3">
        <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg">
          <Ticket className="size-5" aria-hidden />
        </span>
        <p className="text-base font-semibold tracking-tight">{NOMBRE_SISTEMA}</p>
      </div>

      <div className="relative space-y-6">
        <p className="text-muted-foreground max-w-xs text-sm text-pretty">{DESCRIPCION_SISTEMA}</p>

        <div className="space-y-2">
          <p className="text-xs font-medium">El ciclo de un ticket</p>
          <ol className="border-muted-foreground/30 ml-1 space-y-3 border-l">
            {ESTADOS.map(({ etiqueta, punto }) => (
              <li key={etiqueta} className="relative pl-4">
                <span
                  className={`absolute top-1 -left-[5px] size-2.5 rounded-full ${punto}`}
                  aria-hidden
                />
                <span className="text-muted-foreground text-xs">{etiqueta}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="text-muted-foreground relative text-xs">
        Acceso restringido. Las cuentas las crea un administrador.
      </p>
    </aside>
  );
}
