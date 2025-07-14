import { Request, Response } from "express";
import { pool } from "../database";

export async function getAllTemas(_req: Request, res: Response) {
  try {
    const { rows } = await pool.query("SELECT * FROM temas");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener temas" });
  }
}

export async function getTema(req: Request, res: Response) {
  const { id } = req.params;
  const { rows } = await pool.query("SELECT * FROM temas WHERE id_tema = $1", [id]);
  if (rows.length > 0) {
    res.json(rows[0]);
  } else {
    res.status(404).json({ message: "Tema no encontrado" });
  }
}

export async function createTema(req: Request, res: Response) {
  const { codigo_tema, nombre_tema, id_curso_tema } = req.body;
  await pool.query(
    "INSERT INTO temas (codigo_tema, nombre_tema, id_curso_tema) VALUES ($1, $2, $3)",
    [codigo_tema, nombre_tema, id_curso_tema]
  );
  res.status(201).json({ message: "Tema creado correctamente" });
}

export async function updateTema(req: Request, res: Response) {
  const { id } = req.params;
  const { codigo_tema, nombre_tema, id_curso_tema } = req.body;
  await pool.query(
    "UPDATE temas SET codigo_tema = $1, nombre_tema = $2, id_curso_tema = $3 WHERE id_tema = $4",
    [codigo_tema, nombre_tema, id_curso_tema, id]
  );
  res.json({ message: "Tema actualizado" });
}

export async function deleteTema(req: Request, res: Response) {
  const { id } = req.params;
  await pool.query("DELETE FROM temas WHERE id_tema = $1", [id]);
  res.json({ message: "Tema eliminado" });
}