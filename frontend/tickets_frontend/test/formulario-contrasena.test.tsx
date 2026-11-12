import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FormularioContrasena } from "@/components/perfil/formulario-contrasena";

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock("@/lib/api", () => ({ apiFetch: apiFetchMock }));

beforeEach(() => {
  apiFetchMock.mockReset();
});

describe("FormularioContrasena", () => {
  it("rechaza contraseñas nuevas que no coinciden", async () => {
    const user = userEvent.setup();

    render(<FormularioContrasena />);

    await user.type(screen.getByLabelText("Contraseña actual"), "actual123");
    await user.type(screen.getByLabelText("Contraseña nueva"), "nuevaClave123");
    await user.type(screen.getByLabelText("Repetir contraseña nueva"), "otraClave123");
    await user.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("no coinciden");
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("envía el cambio de contraseña", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockResolvedValue({ message: "Contraseña actualizada" });

    render(<FormularioContrasena />);

    await user.type(screen.getByLabelText("Contraseña actual"), "actual123");
    await user.type(screen.getByLabelText("Contraseña nueva"), "nuevaClave123");
    await user.type(screen.getByLabelText("Repetir contraseña nueva"), "nuevaClave123");
    await user.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    await waitFor(() =>
      expect(apiFetchMock).toHaveBeenCalledWith("/autenticacion/contrasena", {
        method: "PATCH",
        body: JSON.stringify({ actual: "actual123", nueva: "nuevaClave123" }),
      })
    );

    await waitFor(() => expect(screen.getByLabelText("Contraseña actual")).toHaveValue(""));
  });
});
