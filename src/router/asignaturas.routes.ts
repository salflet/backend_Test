
import { Router } from "express";
import {
  getAllAsignaturas,
  getAsignatura,
  createAsignatura,
  updateAsignatura,
  deleteAsignatura
} from "../controller/asignaturas.controller";

const router = Router();

router.get("/", getAllAsignaturas);
router.get("/:id", getAsignatura);
router.post("/", createAsignatura);
router.put("/:id", updateAsignatura);
router.delete("/:id", deleteAsignatura);

export default router;
