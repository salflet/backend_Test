// src/controller/academias.controller.ts
import { Request, Response } from 'express';
import { pool } from '../database';

// Obtener todas las academias
export const getAcademias = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const { rows } = await pool.query(
      'SELECT id_academia, nombre_academia, color FROM academias'
    );
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener academias' });
  }
};

// Obtener academia por id
export const getAcademiaById = async (req: Request, res: Response): Promise<Response> => {
  const id = Number(req.params.id);
  try {
    const { rows } = await pool.query(
      'SELECT id_academia, nombre_academia, color FROM academias WHERE id_academia = $1',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Academia no encontrada' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al buscar academia' });
  }
};

// Crear nueva academia
export const createAcademia = async (req: Request, res: Response): Promise<Response> => {
  const {
    nombre_academia,
    color
  }: { nombre_academia: string; color: string } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO academias (nombre_academia, color) VALUES ($1, $2) RETURNING id_academia',
      [nombre_academia, color]
    );
    return res
      .status(201)
      .json({ id_academia: rows[0].id_academia, nombre_academia, color });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al crear academia' });
  }
};

// Actualizar academia
export const updateAcademia = async (req: Request, res: Response): Promise<Response> => {
  const id = Number(req.params.id);
  const {
    nombre_academia,
    color
  }: { nombre_academia: string; color: string } = req.body;
  try {
    const result = await pool.query(
      'UPDATE academias SET nombre_academia = $1, color = $2 WHERE id_academia = $3',
      [nombre_academia, color, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Academia no encontrada' });
    }
    return res.json({ message: 'Academia actualizada' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar academia' });
  }
};

// Eliminar academia
export const deleteAcademia = async (req: Request, res: Response): Promise<Response> => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query(
      'DELETE FROM academias WHERE id_academia = $1',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Academia no encontrada' });
    }
    return res.json({ message: 'Academia eliminada' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al eliminar academia' });
  }
};
