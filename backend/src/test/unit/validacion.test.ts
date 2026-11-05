import { describe, expect, it } from "vitest";
import { z } from "zod";

import { requerirId } from "@/utils/solicitud";
import { validar } from "@/utils/validacion";

const schema = z.object({ nombre: z.string().min(1) });

describe("validar", () => {
  it("devuelve los datos cuando el esquema se cumple", () => {
    expect(validar(schema, { nombre: "Ana" })).toEqual({ nombre: "Ana" });
  });

  it("lanza un 400 con los detalles del error", () => {
    expect(() => validar(schema, { nombre: "" })).toThrowError(
      expect.objectContaining({ status: 400, message: "Datos de entrada inválidos" })
    );
  });

  it("permite cambiar el mensaje de error", () => {
    expect(() => validar(schema, {}, "Parámetros de consulta inválidos")).toThrowError(
      expect.objectContaining({ message: "Parámetros de consulta inválidos" })
    );
  });
});

describe("requerirId", () => {
  it("acepta un uuid válido", () => {
    const id = "33333333-3333-4333-8333-333333333333";

    expect(requerirId({ id })).toBe(id);
  });

  it("lanza un 400 cuando el id no es un uuid", () => {
    expect(() => requerirId({ id: "abc" })).toThrowError(expect.objectContaining({ status: 400 }));
  });
});
