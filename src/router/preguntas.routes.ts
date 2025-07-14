import { Router } from "express";
import {
  createPregunta,
  getPreguntasByEncargo,
  getAllPreguntas,
  updatePregunta,
  deletePregunta
} from "../controller/preguntas.controller";

const router = Router();

// Crear una nueva pregunta
router.post("/", createPregunta);

// Obtener preguntas de un encargo específico
router.get("/encargo/:id_encargo", getPreguntasByEncargo);

// Obtener todas las preguntas (opcional)
router.get("/", getAllPreguntas);

router.put("/:id_pregunta", updatePregunta);
router.delete("/:id_pregunta", deletePregunta);

export default router;
