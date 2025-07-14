import { Request, Response } from 'express';
import { pool } from '../database';
import { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';

// Obtener todos los estados
export const getEstados = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id_estado, nombre_estado, descripcion_estado FROM estados');
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
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id_estado, nombre_estado, descripcion_estado FROM estados WHERE id_estado = ?',
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
    const [result] = await pool.query<OkPacket>(
      'INSERT INTO estados (nombre_estado, descripcion_estado) VALUES (?, ?)',
      [nombre_estado, descripcion_estado || null]
    );
    return res.status(201).json({ id_estado: result.insertId, nombre_estado, descripcion_estado });
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
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE estados SET nombre_estado = ?, descripcion_estado = ? WHERE id_estado = ?',
      [nombre_estado, descripcion_estado || null, id]
    );
    if (result.affectedRows === 0) {
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
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM estados WHERE id_estado = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Estado no encontrado' });
    }
    return res.json({ message: 'Estado eliminado' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al eliminar estado' });
  }
};
