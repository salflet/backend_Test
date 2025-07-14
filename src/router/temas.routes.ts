
import { Router } from "express";
import {
  getAllTemas,
  getTema,
  createTema,
  updateTema,
  deleteTema
} from "../controller/temas.controller";

const router = Router();

router.get("/", getAllTemas);
router.get("/:id", getTema);
router.post("/", createTema);
router.put("/:id", updateTema);
router.delete("/:id", deleteTema);

export default router;
