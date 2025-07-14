import { Request, Response } from "express";
import { pool } from "../database";
import { RowDataPacket } from "mysql2";

export async function getAllCursos(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM cursos");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener cursos" });
  }
}

export async function getCurso(req: Request, res: Response) {
  const { id } = req.params;
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM cursos WHERE id_curso = ?", [id]);
  if ((rows as RowDataPacket[]).length > 0) {
    res.json((rows as RowDataPacket[])[0]);
  } else {
    res.status(404).json({ message: "Curso no encontrado" });
  }
}

export async function createCurso(req: Request, res: Response) {
  const { nombre_curso } = req.body;
  await pool.query("INSERT INTO cursos (nombre_curso) VALUES (?)", [nombre_curso]);
  res.status(201).json({ message: "Curso creado correctamente" });
}

export async function updateCurso(req: Request, res: Response) {
  const { id } = req.params;
  const { nombre_curso } = req.body;
  await pool.query("UPDATE cursos SET nombre_curso = ? WHERE id_curso = ?", [nombre_curso, id]);
  res.json({ message: "Curso actualizado" });
}

export async function deleteCurso(req: Request, res: Response) {
  const { id } = req.params;
  await pool.query("DELETE FROM cursos WHERE id_curso = ?", [id]);
  res.json({ message: "Curso eliminado" });
}