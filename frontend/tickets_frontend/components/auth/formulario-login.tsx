"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";
import { authService } from "@/services/auth.service";

export function FormularioLogin() {
  const router = useRouter();
  const { sesion } = useAuth();

  const [correoElectronico, setCorreoElectronico] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await authService.login({
        correo_electronico: correoElectronico.trim(),
        contrasena,
      });
      router.replace("/tickets");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof ApiError ? loginError.message : "No se pudo iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card aria-labelledby="login-titulo">
      <CardHeader>
        <CardTitle id="login-titulo" className="text-xl tracking-tight">
          Iniciar sesión
        </CardTitle>
        <CardDescription>Accede con la cuenta que te asignó un administrador.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} aria-labelledby="login-titulo">
        <CardContent className="space-y-4">
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="correo_electronico">Correo electrónico</Label>
            <Input
              id="correo_electronico"
              type="email"
              autoComplete="username"
              placeholder="usuario@ejemplo.com"
              value={correoElectronico}
              onChange={evento => setCorreoElectronico(evento.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contrasena">Contraseña</Label>
            <Input
              id="contrasena"
              type="password"
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={contrasena}
              onChange={evento => setContrasena(evento.target.value)}
              required
            />
          </div>

          {sesion && (
            <p className="text-muted-foreground text-sm">
              Ya tienes una sesión activa.{" "}
              <Link
                href={sesion.usuario.rol === "Administrador" ? "/users" : "/perfil"}
                className="text-foreground underline underline-offset-4"
              >
                Continuar
              </Link>
            </p>
          )}
        </CardContent>

        <CardFooter className="mt-4 flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </Button>
          <p className="text-muted-foreground text-center text-xs">
            Las cuentas son creadas por un administrador.
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
