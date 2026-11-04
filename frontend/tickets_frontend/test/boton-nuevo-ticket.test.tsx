import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BotonNuevoTicket } from "@/components/tickets/boton-nuevo-ticket";

const estado = vi.hoisted(() => ({
  sesion: null as unknown,
  pathname: "/tickets",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => estado.pathname,
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ sesion: estado.sesion, isClient: true }),
}));

const sesion = {
  token: "token",
  usuario: {
    id: "11111111-1111-4111-8111-111111111111",
    nombre: "Cliente",
    correo_electronico: "usuario@example.com",
    rol: "Usuario",
  },
};

beforeEach(() => {
  estado.sesion = null;
  estado.pathname = "/tickets";
});

describe("BotonNuevoTicket", () => {
  it("no se muestra sin sesión", () => {
    render(<BotonNuevoTicket />);

    expect(screen.queryByRole("link", { name: "Nuevo ticket" })).not.toBeInTheDocument();
  });

  it("se muestra con sesión y apunta al formulario", () => {
    estado.sesion = sesion;

    render(<BotonNuevoTicket />);

    expect(screen.getByRole("link", { name: "Nuevo ticket" })).toHaveAttribute(
      "href",
      "/tickets/nuevo"
    );
  });

  it("se oculta dentro del formulario", () => {
    estado.sesion = sesion;
    estado.pathname = "/tickets/nuevo";

    render(<BotonNuevoTicket />);

    expect(screen.queryByRole("link", { name: "Nuevo ticket" })).not.toBeInTheDocument();
  });
});
