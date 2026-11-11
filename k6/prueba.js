import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "5s", target: 5 },
    { duration: "15s", target: 5 },
    { duration: "5s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000/api/v1";
const CORREO = __ENV.CORREO || "admin@example.com";
const CONTRASENA = __ENV.CONTRASENA || "admin123";

export function setup() {
  const respuesta = http.post(
    `${BASE_URL}/autenticacion/login`,
    JSON.stringify({ correo_electronico: CORREO, contrasena: CONTRASENA }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(respuesta, { "inicio de sesión correcto": r => r.status === 200 });

  return { token: respuesta.json("token") };
}

export default function (datos) {
  const cabeceras = { headers: { Authorization: `Bearer ${datos.token}` } };

  const salud = http.get(`${BASE_URL}/salud`);
  check(salud, { "salud responde": r => r.status === 200 });

  const lista = http.get(`${BASE_URL}/tickets?pagina=1&limite=10`, cabeceras);
  check(lista, {
    "lista responde": r => r.status === 200,
    "lista trae datos": r => Array.isArray(r.json("data")),
  });

  sleep(1);
}
