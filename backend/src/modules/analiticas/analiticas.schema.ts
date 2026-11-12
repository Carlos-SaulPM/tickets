import { z } from "zod";

export const dashboardQuerySchema = z
  .object({
    desde: z.coerce.date().optional(),
    hasta: z.coerce.date().optional(),
    area_id: z.uuid().optional(),
    categoria_id: z.uuid().optional(),
    asignado_a_id: z.uuid().optional(),
  })
  .refine(data => !data.desde || !data.hasta || data.desde <= data.hasta, {
    message: "El rango de fechas es inválido",
  });

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
