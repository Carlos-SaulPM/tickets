export const ZONA_HORARIA = "America/Mexico_City";

const formateador = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: ZONA_HORARIA,
});

export const formatearFecha = (iso: string) => formateador.format(new Date(iso));
