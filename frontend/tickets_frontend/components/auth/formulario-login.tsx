"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { authService } from "@/services/auth.service";

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const mensajeDeError = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.status === 400 || error.status === 401
      ? "Credenciales inválidas. Revisa tu correo y contraseña."
      : "El servidor no pudo procesar el ingreso. Intenta de nuevo.";
  }

  return "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.";
};

export function FormularioLogin({ motivo }: { motivo?: string }) {
  const router = useRouter();

  const [correoElectronico, setCorreoElectronico] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const limpiarError = () => {
    if (error) setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const correo = correoElectronico.trim();

    if (!correo || !contrasena) {
      setError("Ingresa tu correo y tu contraseña.");
      return;
    }

    if (!CORREO_VALIDO.test(correo)) {
      setError("Revisa el correo electrónico.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await authService.login({ correo_electronico: correo, contrasena });
      router.replace("/tickets");
      router.refresh();
    } catch (loginError) {
      setError(mensajeDeError(loginError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h1 id="login-titulo" className="text-2xl font-bold tracking-tight">
          Iniciar sesión
        </h1>
        <CardDescription>Accede con la cuenta de tu organización.</CardDescription>
      </CardHeader>

      <form
        noValidate
        onSubmit={handleSubmit}
        aria-labelledby="login-titulo"
        aria-busy={isSubmitting}
      >
        <CardContent className="space-y-4 pb-4">
          {motivo === "expirada" && (
            <p
              role="status"
              className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm"
            >
              Tu sesión expiró. Vuelve a ingresar.
            </p>
          )}

          {error && (
            <p
              id="login-error"
              ref={errorRef}
              role="alert"
              tabIndex={-1}
              className="text-destructive text-sm outline-none"
            >
              {error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="correo_electronico">Correo electrónico</Label>
            <Input
              id="correo_electronico"
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="usuario@ejemplo.com"
              className="h-10 sm:h-8"
              value={correoElectronico}
              onChange={evento => {
                setCorreoElectronico(evento.target.value);
                limpiarError();
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "login-error" : undefined}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contrasena">Contraseña</Label>
            <div className="relative">
              <Input
                id="contrasena"
                type={verContrasena ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Tu contraseña"
                className="h-10 pr-10 sm:h-8"
                value={contrasena}
                onChange={evento => {
                  setContrasena(evento.target.value);
                  limpiarError();
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "login-error" : undefined}
                required
              />
              <button
                type="button"
                onClick={() => setVerContrasena(actual => !actual)}
                aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={verContrasena}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg focus-visible:ring-3 focus-visible:outline-none"
              >
                {verContrasena ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" className="h-10 w-full sm:h-8" disabled={isSubmitting}>
            {isSubmitting ? "Entrando…" : "Entrar"}
          </Button>
          <p className="text-muted-foreground text-center text-xs">
            ¿No puedes entrar? Un administrador puede restablecerla.
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
