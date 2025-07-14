
import { Router } from "express";
import {
  getAllCursos,
  getCurso,
  createCurso,
  updateCurso,
  deleteCurso
} from "../controller/cursos.controller";

const router = Router();

router.get("/", getAllCursos);
router.get("/:id", getCurso);
router.post("/", createCurso);
router.put("/:id", updateCurso);
router.delete("/:id", deleteCurso);

export default router;
