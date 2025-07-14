import { Request, Response } from 'express';
import { pool } from '../database';

// Obtener todos los estados
export const getEstados = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const { rows } = await pool.query('SELECT id_estado, nombre_estado, descripcion_estado FROM estados');
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener estados' });
  }
};

// Obtener estado por id
export const getEstadoById = async (req: Request, res: Response): Promise<Response> => {
  const id = Number(req.params.id);
  try {
    const { rows } = await pool.query(
      'SELECT id_estado, nombre_estado, descripcion_estado FROM estados WHERE id_estado = $1',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Estado no encontrado' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al buscar estado' });
  }
};

// Crear nuevo estado
export const createEstado = async (req: Request, res: Response): Promise<Response> => {
  const { nombre_estado, descripcion_estado }: { nombre_estado: string; descripcion_estado?: string } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO estados (nombre_estado, descripcion_estado) VALUES ($1, $2) RETURNING id_estado',
      [nombre_estado, descripcion_estado || null]
    );
    return res.status(201).json({ id_estado: rows[0].id_estado, nombre_estado, descripcion_estado });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al crear estado' });
  }
};

// Actualizar estado
export const updateEstado = async (req: Request, res: Response): Promise<Response> => {
  const id = Number(req.params.id);
  const { nombre_estado, descripcion_estado }: { nombre_estado: string; descripcion_estado?: string } = req.body;
  try {
    const result = await pool.query(
      'UPDATE estados SET nombre_estado = $1, descripcion_estado = $2 WHERE id_estado = $3',
      [nombre_estado, descripcion_estado || null, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Estado no encontrado' });
    }
    return res.json({ message: 'Estado actualizado' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar estado' });
  }
};

// Eliminar estado
export const deleteEstado = async (req: Request, res: Response): Promise<Response> => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query(
      'DELETE FROM estados WHERE id_estado = $1',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Estado no encontrado' });
    }
    return res.json({ message: 'Estado eliminado' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al eliminar estado' });
  }
};
