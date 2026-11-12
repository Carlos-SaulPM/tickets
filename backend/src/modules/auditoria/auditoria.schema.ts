import { z } from "zod";

import { EntidadAuditoria } from "@/generated/prisma/enums";

export const listarAuditoriaQuerySchema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(100).default(20),
  entidad: z.enum(EntidadAuditoria).optional(),
});

export type ListarAuditoriaQuery = z.infer<typeof listarAuditoriaQuerySchema>;
