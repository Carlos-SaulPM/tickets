import { Router } from "express";

import { usersController } from "./users.controller";

const router = Router();

// la ruta para probar sera /api/v1/users/
router.post("/", usersController.create);

router.patch("/:id", usersController.update);

router.delete("/:id", usersController.delete);

router.get("/", usersController.getAll);

router.get("/:id", usersController.getById);

export default router;
