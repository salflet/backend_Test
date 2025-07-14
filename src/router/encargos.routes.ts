import { Router } from "express";
import {
  createEncargo,
  getEncargos,
  getEncargosByUser,
  getEncargoById,
  getSubencargos,
  updateEncargo,
  patchEstadoEncargo,
  deleteEncargo,
  downloadEncargoPreguntasExcel
} from "../controller/encargos.controller";

const router = Router();

// 1) Ruta para descarga de Excel (misma pestaña)
//    GET /api/encargos/download/:id_encargo/:pid/:code
router.get(
  "/download/:id_encargo/:pid/:code",
  downloadEncargoPreguntasExcel
);

// 2) Rutas de consulta CRUD
router.get("/", getEncargos);
router.get("/user/:userId", getEncargosByUser);
router.get("/subencargos/:id", getSubencargos);
router.get("/:id", getEncargoById);

router.post("/", createEncargo);
router.patch("/:id", updateEncargo);
router.patch("/:id/:id_estado_encargo", patchEstadoEncargo);
router.delete("/:id", deleteEncargo);

export default router;
