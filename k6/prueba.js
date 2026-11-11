import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { check } from "k6";
import http from "k6/http";

const baseUrl = __ENV.BASE_URL || "http://localhost:3000/api/v1";
const correo = __ENV.CORREO || "admin@example.com";
const contrasena = __ENV.CONTRASENA || "admin123";

export default function () {
  const salud = http.get(baseUrl + "/salud");
  check(salud, {
    "Salud status code 200": r => r.status == 200,
  });

  const login = http.post(
    baseUrl + "/autenticacion/login",
    JSON.stringify({ correo_electronico: correo, contrasena: contrasena }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(login, {
    "Login status code 200": r => r.status == 200,
  });

  const token = login.json("token");
  const cabeceras = { headers: { Authorization: `Bearer ${token}` } };

  const tickets = http.get(baseUrl + "/tickets?pagina=1&limite=5", cabeceras);
  check(tickets, {
    "Tickets status code 200": r => r.status == 200,
  });

  const notificaciones = http.get(baseUrl + "/notificaciones?limite=5", cabeceras);
  check(notificaciones, {
    "Notificaciones status code 200": r => r.status == 200,
  });
}

export function handleSummary(data) {
  return {
    "index.html": htmlReport(data),
  };
}
