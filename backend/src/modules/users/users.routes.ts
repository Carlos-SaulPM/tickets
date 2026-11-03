import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { usersController } from "./users.controller";

const router = Router();

// la ruta para probar sera /api/v1/users/
router.use(authMiddleware);

router.post("/", usersController.create.bind(usersController));

router.patch("/:id", usersController.update.bind(usersController));

router.delete("/:id", usersController.delete.bind(usersController));

router.get("/", usersController.getAll.bind(usersController));

router.get("/:id", usersController.getById.bind(usersController));

export default router;
