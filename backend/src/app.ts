import cors from "cors";
import express, { type Express } from "express";
import morgan from "morgan";

import { env } from "@/config/env";
import { errorHandler } from "@/middlewares/error-handler";
import { notFound } from "@/middlewares/not-found";
import { apiRouter } from "@/routes/index";

export const createApp = (): Express => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.use("/api/v1", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
