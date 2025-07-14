import { Request, Response } from "express";
import { pool } from "../database";
import { RowDataPacket } from "mysql2";

export async function getAllTemas(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM temas");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener temas" });
  }
}

export async function getTema(req: Request, res: Response) {
  const { id } = req.params;
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM temas WHERE id_tema = ?", [id]);
  if ((rows as RowDataPacket[]).length > 0) {
    res.json((rows as RowDataPacket[])[0]);
  } else {
    res.status(404).json({ message: "Tema no encontrado" });
  }
}

export async function createTema(req: Request, res: Response) {
  const { codigo_tema, nombre_tema, id_curso_tema } = req.body;
  await pool.query("INSERT INTO temas (codigo_tema, nombre_tema, id_curso_tema) VALUES (?, ?, ?)", [codigo_tema, nombre_tema, id_curso_tema]);
  res.status(201).json({ message: "Tema creado correctamente" });
}

export async function updateTema(req: Request, res: Response) {
  const { id } = req.params;
  const { codigo_tema, nombre_tema, id_curso_tema } = req.body;
  await pool.query("UPDATE temas SET codigo_tema = ?, nombre_tema = ?, id_curso_tema = ? WHERE id_tema = ?", [codigo_tema, nombre_tema, id_curso_tema, id]);
  res.json({ message: "Tema actualizado" });
}

export async function deleteTema(req: Request, res: Response) {
  const { id } = req.params;
  await pool.query("DELETE FROM temas WHERE id_tema = ?", [id]);
  res.json({ message: "Tema eliminado" });
}