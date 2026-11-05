import { beforeEach, describe, expect, it, vi } from "vitest";

import { construirCorreo } from "@/services/correo/plantillas";
import { ServicioCorreoNodemailer } from "@/services/correo/servicio-nodemailer";

interface CorreoEnviado {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

const { enviarMock, crearTransporteMock } = vi.hoisted(() => ({
  enviarMock: vi.fn<(correo: CorreoEnviado) => Promise<void>>(),
  crearTransporteMock: vi.fn(),
}));

vi.mock("nodemailer", () => ({
  default: { createTransport: crearTransporteMock },
}));

const configuracion = {
  host: "mailpit",
  port: 1025,
  secure: false,
  remitente: "Sistema de Tickets <no-reply@test.local>",
  urlPublica: "http://localhost:3001/",
};

const datos = { ticket: "#D-001", ticket_id: "11111111-1111-4111-8111-111111111111" };
const payload = {
  destinatario: "usuario@example.com",
  asunto: "#D-001: No enciende",
  plantilla: "MENSAJE_NUEVO" as const,
  datos: { ...datos, mensaje: "Hay una nueva respuesta" },
};

beforeEach(() => {
  enviarMock.mockReset();
  crearTransporteMock.mockReset();
  crearTransporteMock.mockReturnValue({ sendMail: enviarMock });
});

describe("construirCorreo", () => {
  it("incluye el ticket, el mensaje y el enlace", () => {
    const { html, texto } = construirCorreo(
      "MENSAJE_NUEVO",
      payload.datos,
      "http://localhost:3001/tickets/1"
    );

    expect(html).toContain("#D-001");
    expect(html).toContain("Hay una nueva respuesta");
    expect(html).toContain("http://localhost:3001/tickets/1");
    expect(texto).toContain("Hay una nueva respuesta");
    expect(texto).toContain("http://localhost:3001/tickets/1");
  });

  it("cambia el texto según la plantilla", () => {
    const propuesta = construirCorreo("SOLUCION_PROPUESTA", payload.datos, "");
    const estado = construirCorreo("ESTADO_CAMBIADO", payload.datos, "");

    expect(propuesta.texto).toContain("solución");
    expect(estado.texto).toContain("cambió");
    expect(propuesta.html).not.toContain("Ver el ticket");
  });

  it("funciona cuando las plantillas no traen datos", () => {
    const { texto } = construirCorreo("ESTADO_CAMBIADO", {}, "");

    expect(texto).toContain("El ticket");
  });
});

describe("ServicioCorreoNodemailer", () => {
  it("envía el correo con el remitente y el asunto indicados", async () => {
    enviarMock.mockResolvedValue(undefined);

    const servicio = new ServicioCorreoNodemailer(configuracion);
    const enviado = await servicio.enviarCorreo(payload);
    const correo = enviarMock.mock.calls[0]?.[0];

    expect(enviado).toBe(true);
    expect(crearTransporteMock).toHaveBeenCalledWith({
      host: "mailpit",
      port: 1025,
      secure: false,
    });
    expect(correo).toMatchObject({
      from: configuracion.remitente,
      to: payload.destinatario,
      subject: payload.asunto,
    });
    expect(correo?.html).toContain("#D-001");
    expect(correo?.text).toContain("Hay una nueva respuesta");
  });

  it("agrega la autenticación cuando hay credenciales", () => {
    new ServicioCorreoNodemailer({
      ...configuracion,
      autenticacion: { usuario: "usuario", contrasena: "secreto" },
    });

    expect(crearTransporteMock).toHaveBeenCalledWith(
      expect.objectContaining({ auth: { user: "usuario", pass: "secreto" } })
    );
  });

  it("devuelve false y no lanza cuando el SMTP falla", async () => {
    const error = new Error("conexión rechazada");

    enviarMock.mockRejectedValue(error);
    const consola = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const servicio = new ServicioCorreoNodemailer(configuracion);

    await expect(servicio.enviarCorreo(payload)).resolves.toBe(false);
    expect(consola).toHaveBeenCalled();

    consola.mockRestore();
  });
});
