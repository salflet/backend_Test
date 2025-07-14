import { Request, Response } from "express";
import { pool } from "../database";

export async function getAllCursos(_req: Request, res: Response) {
  try {
    const { rows } = await pool.query("SELECT * FROM cursos");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener cursos" });
  }
}

export async function getCurso(req: Request, res: Response) {
  const { id } = req.params;
  const { rows } = await pool.query("SELECT * FROM cursos WHERE id_curso = $1", [id]);
  if (rows.length > 0) {
    res.json(rows[0]);
  } else {
    res.status(404).json({ message: "Curso no encontrado" });
  }
}

export async function createCurso(req: Request, res: Response) {
  const { nombre_curso } = req.body;
  await pool.query("INSERT INTO cursos (nombre_curso) VALUES ($1)", [nombre_curso]);
  res.status(201).json({ message: "Curso creado correctamente" });
}

export async function updateCurso(req: Request, res: Response) {
  const { id } = req.params;
  const { nombre_curso } = req.body;
  await pool.query("UPDATE cursos SET nombre_curso = $1 WHERE id_curso = $2", [nombre_curso, id]);
  res.json({ message: "Curso actualizado" });
}

export async function deleteCurso(req: Request, res: Response) {
  const { id } = req.params;
  await pool.query("DELETE FROM cursos WHERE id_curso = $1", [id]);
  res.json({ message: "Curso eliminado" });
}