import { Request, Response } from "express";
import { pool } from "../database";
import { RowDataPacket } from "mysql2";

export async function getAllAsignaturas(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM asignaturas");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener asignaturas" });
  }
}

export async function getAsignatura(req: Request, res: Response) {
  const { id } = req.params;
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM asignaturas WHERE id_asignatura = ?", [id]);
  if ((rows as RowDataPacket[]).length > 0) {
    res.json((rows as RowDataPacket[])[0]);
  } else {
    res.status(404).json({ message: "Asignatura no encontrada" });
  }
}

export async function createAsignatura(req: Request, res: Response) {
  const { codigo_asignatura, nombre_asignatura } = req.body;
  await pool.query("INSERT INTO asignaturas (codigo_asignatura, nombre_asignatura) VALUES (?, ?)", [codigo_asignatura, nombre_asignatura]);
  res.status(201).json({ message: "Asignatura creada correctamente" });
}

export async function updateAsignatura(req: Request, res: Response) {
  const { id } = req.params;
  const { codigo_asignatura, nombre_asignatura } = req.body;
  await pool.query("UPDATE asignaturas SET codigo_asignatura = ?, nombre_asignatura = ? WHERE id_asignatura = ?", [codigo_asignatura, nombre_asignatura, id]);
  res.json({ message: "Asignatura actualizada" });
}

export async function deleteAsignatura(req: Request, res: Response) {
  const { id } = req.params;
  await pool.query("DELETE FROM asignaturas WHERE id_asignatura = ?", [id]);
  res.json({ message: "Asignatura eliminada" });
}