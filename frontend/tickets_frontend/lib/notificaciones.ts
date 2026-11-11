const EVENTO = "notificaciones:actualizadas";

export const avisarCambioDeNotificaciones = () => {
  window.dispatchEvent(new Event(EVENTO));
};

export const alCambiarNotificaciones = (accion: () => void) => {
  window.addEventListener(EVENTO, accion);

  return () => window.removeEventListener(EVENTO, accion);
};
