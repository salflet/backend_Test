import { Router } from "express";
import { listUsers, deleteUser } from "../controller/users.controller";

const router = Router();

// Nueva ruta para listar usuarios
router.get("/users", listUsers);
router.delete("/users/:id", deleteUser);

export default router;
