import { Router } from "express";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { UsersController } from "./users.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", UsersController.create.bind(UsersController));

router.patch("/:id", UsersController.update.bind(UsersController));

router.delete("/:id", UsersController.delete.bind(UsersController));

router.get("/", UsersController.getAll.bind(UsersController));

router.get("/:id", UsersController.getById.bind(UsersController));

export default router;
