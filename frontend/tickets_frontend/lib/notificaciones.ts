const EVENTO = "notificaciones:actualizadas";

/**
 * Avisa a la campana de la navbar que el contador cambió, sin acoplarla
 * a la pantalla que hizo la acción.
 */
export const avisarCambioDeNotificaciones = () => {
  window.dispatchEvent(new Event(EVENTO));
};

export const alCambiarNotificaciones = (accion: () => void) => {
  window.addEventListener(EVENTO, accion);

  return () => window.removeEventListener(EVENTO, accion);
};
