import { Request, Response } from "express";
import { pool } from "../database";

// Crear una nueva pregunta para un encargo
export async function createPregunta(req: Request, res: Response) {
  try {
    const {
      enunciado_pregunta,
      opcion1_pregunta,
      opcion2_pregunta,
      opcion3_pregunta,
      opcion4_pregunta, // opcional
      respuesta_correcta_pregunta,
      explicacion_pregunta,
      id_encargo
    } = req.body;

    // Validación obligatoria solo para las tres primeras opciones
    if (
      !enunciado_pregunta || !opcion1_pregunta || !opcion2_pregunta ||
      !opcion3_pregunta || !respuesta_correcta_pregunta || !id_encargo
    ) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Si la opción D fue marcada como respuesta correcta pero no se proporcionó contenido
    if (respuesta_correcta_pregunta === "D" && (!opcion4_pregunta || opcion4_pregunta.trim() === "")) {
      return res.status(400).json({
        message: "La opción D está vacía. No puede ser la respuesta correcta."
      });
    }


    const { rows: preguntas } = await pool.query(
      "SELECT COUNT(*) AS total FROM preguntas WHERE id_encargo = $1",
      [id_encargo]
    );
    const preguntasActuales = Number(preguntas[0].total);

    const { rows: encargoData } = await pool.query(
      "SELECT numero_preguntas_encargo FROM encargos WHERE id_encargo = $1",
      [id_encargo]
    );

    if (encargoData.length === 0) {
      return res.status(404).json({ message: "Encargo no encontrado" });
    }

    const tope = encargoData[0].numero_preguntas_encargo;

    if (preguntasActuales >= tope) {
      return res.status(400).json({
        message: `Este encargo ya tiene el número máximo de preguntas (${tope}).`
      });
    }

    await pool.query(
      `INSERT INTO preguntas
      (enunciado_pregunta, opcion1_pregunta, opcion2_pregunta, opcion3_pregunta, opcion4_pregunta, respuesta_correcta_pregunta, explicacion_pregunta, id_encargo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        enunciado_pregunta,
        opcion1_pregunta,
        opcion2_pregunta,
        opcion3_pregunta,
        opcion4_pregunta || "",
        respuesta_correcta_pregunta,
        explicacion_pregunta || "",
        id_encargo
      ]
    );

    return res.status(201).json({ message: "Pregunta creada correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al crear la pregunta" });
  }
}

// Obtener todas las preguntas de un encargo
export async function getPreguntasByEncargo(req: Request, res: Response) {
  try {
    const { id_encargo } = req.params;


    const { rows } = await pool.query(
      "SELECT * FROM preguntas WHERE id_encargo = $1",
      [id_encargo]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener las preguntas" });
  }
}

// Obtener todas las preguntas
export async function getAllPreguntas(_req: Request, res: Response) {
  try {
    const { rows } = await pool.query("SELECT * FROM preguntas");
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener todas las preguntas" });
  }
}

// Actualizar una pregunta
export async function updatePregunta(req: Request, res: Response) {
  try {
    const { id_pregunta } = req.params;
    const {
      enunciado_pregunta,
      opcion1_pregunta,
      opcion2_pregunta,
      opcion3_pregunta,
      opcion4_pregunta,
      respuesta_correcta_pregunta,
      explicacion_pregunta
    } = req.body;


    const { rows: existing } = await pool.query(
      "SELECT * FROM preguntas WHERE id_pregunta = $1",
      [id_pregunta]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Pregunta no encontrada" });
    }

    await pool.query(
      `UPDATE preguntas SET
        enunciado_pregunta = $1,
        opcion1_pregunta = $2,
        opcion2_pregunta = $3,
        opcion3_pregunta = $4,
        opcion4_pregunta = $5,
        respuesta_correcta_pregunta = $6,
        explicacion_pregunta = $7
      WHERE id_pregunta = $8`,
      [
        enunciado_pregunta,
        opcion1_pregunta,
        opcion2_pregunta,
        opcion3_pregunta,
        opcion4_pregunta,
        respuesta_correcta_pregunta,
        explicacion_pregunta || "",
        id_pregunta
      ]
    );

    return res.status(200).json({ message: "Pregunta actualizada correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al actualizar la pregunta" });
  }
}

// Eliminar una pregunta
export async function deletePregunta(req: Request, res: Response) {
  try {
    const { id_pregunta } = req.params;


    const { rows: existing } = await pool.query(
      "SELECT * FROM preguntas WHERE id_pregunta = $1",
      [id_pregunta]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Pregunta no encontrada" });
    }

    await pool.query("DELETE FROM preguntas WHERE id_pregunta = $1", [id_pregunta]);

    return res.status(200).json({ message: "Pregunta eliminada correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al eliminar la pregunta" });
  }
}