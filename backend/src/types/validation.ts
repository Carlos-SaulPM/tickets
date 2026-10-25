import type { z } from "zod";

export type ValidationSchemas = {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
};
