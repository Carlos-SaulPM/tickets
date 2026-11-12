import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FiltrosAuditoria } from "@/components/auditoria/filtros-auditoria";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

beforeEach(() => {
  pushMock.mockReset();
});

describe("FiltrosAuditoria", () => {
  it("filtra por entidad", async () => {
    const user = userEvent.setup();

    render(<FiltrosAuditoria entidad={undefined} />);

    await user.click(screen.getByRole("combobox", { name: "Entidad" }));
    await user.click(await screen.findByRole("option", { name: "Usuarios" }));

    expect(pushMock).toHaveBeenCalledWith("/auditoria?entidad=USUARIO");
  });

  it("quita el filtro al elegir todas", async () => {
    const user = userEvent.setup();

    render(<FiltrosAuditoria entidad="USUARIO" />);

    await user.click(screen.getByRole("combobox", { name: "Entidad" }));
    await user.click(await screen.findByRole("option", { name: "Todas" }));

    expect(pushMock).toHaveBeenCalledWith("/auditoria");
  });
});
