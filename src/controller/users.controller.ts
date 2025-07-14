// src/controller/users.controller.ts
import { Request, Response } from "express";
import { pool } from "../database";

export const listUsers = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const {
      rows: users,
    } = await pool.query(
      `SELECT
         id,
         username,
         email,
         full_name,
         phone_number,
         role_id,
         id_academia,
         is_active,
         created_at,
         updated_at
       FROM users`
    );
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

/**
 * Elimina un usuario por su ID.
 * Ruta: DELETE /api/users/:id
 */
export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  // Validar que venga un ID numérico
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ message: "ID de usuario inválido" });
  }

  try {
    // Ejecutamos la eliminación
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1",
      [Number(id)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al eliminar usuario" });
  }
};
