"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

export function FormularioContrasena() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const guardar = async (evento: FormEvent) => {
    evento.preventDefault();

    if (nueva.length < 8) {
      setError("La contraseña nueva debe tener al menos 8 caracteres");
      return;
    }

    if (nueva !== repetir) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }

    setError("");
    setEnviando(true);

    try {
      await apiFetch("/autenticacion/contrasena", {
        method: "PATCH",
        body: JSON.stringify({ actual, nueva }),
      });

      toast.success("Contraseña actualizada");
      setActual("");
      setNueva("");
      setRepetir("");
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : "No se pudo cambiar la contraseña");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={guardar} className="space-y-4" noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="contrasena-actual">Contraseña actual</Label>
        <Input
          id="contrasena-actual"
          type="password"
          autoComplete="current-password"
          value={actual}
          onChange={evento => setActual(evento.target.value)}
          required
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="contrasena-nueva">Contraseña nueva</Label>
        <Input
          id="contrasena-nueva"
          type="password"
          autoComplete="new-password"
          value={nueva}
          onChange={evento => setNueva(evento.target.value)}
          aria-describedby="ayuda-contrasena"
          required
        />
        <p id="ayuda-contrasena" className="text-muted-foreground text-xs">
          Mínimo 8 caracteres.
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="contrasena-repetir">Repetir contraseña nueva</Label>
        <Input
          id="contrasena-repetir"
          type="password"
          autoComplete="new-password"
          value={repetir}
          onChange={evento => setRepetir(evento.target.value)}
          required
        />
      </div>

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <Button type="submit" disabled={enviando}>
        {enviando ? "Guardando..." : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
