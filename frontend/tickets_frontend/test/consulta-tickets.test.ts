import { describe, expect, it } from "vitest";

import {
  construirConsultaTickets,
  leerFiltrosTickets,
  TICKETS_POR_PAGINA,
} from "@/lib/consulta-tickets";

describe("construirConsultaTickets", () => {
  it("omite valores vacíos o indefinidos", () => {
    expect(construirConsultaTickets()).toBe("");
    expect(construirConsultaTickets({ estado: undefined, buscar: "" })).toBe("");
  });

  it("serializa filtros, búsqueda y paginación", () => {
    expect(
      construirConsultaTickets({ estado: "Abierto", buscar: "impresora", pagina: 2, limite: 10 })
    ).toBe("estado=Abierto&buscar=impresora&pagina=2&limite=10");
  });
});

describe("leerFiltrosTickets", () => {
  it("usa la primera página cuando no hay parámetros", () => {
    expect(leerFiltrosTickets({})).toEqual({
      estado: undefined,
      prioridad: undefined,
      buscar: undefined,
      pagina: 1,
      limite: TICKETS_POR_PAGINA,
    });
  });

  it("normaliza valores válidos", () => {
    expect(leerFiltrosTickets({ estado: "Cerrado", buscar: "  teclado  ", pagina: "3" })).toEqual({
      estado: "Cerrado",
      prioridad: undefined,
      buscar: "teclado",
      pagina: 3,
      limite: TICKETS_POR_PAGINA,
    });
  });

  it("descarta valores inválidos", () => {
    expect(leerFiltrosTickets({ estado: "Inventado", pagina: "0" })).toMatchObject({
      estado: undefined,
      pagina: 1,
    });
  });
});
