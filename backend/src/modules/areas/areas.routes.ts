import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { AreasController } from "./areas.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", AreasController.getAll.bind(AreasController));
router.post("/", AreasController.create.bind(AreasController));
router.patch("/:id", AreasController.update.bind(AreasController));

export default router;
