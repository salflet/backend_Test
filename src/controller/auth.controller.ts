// src/controller/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../database";
import config from "../config";

export const signup = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Campos recibidos en formulario: username, email, password, role_id, id_academia
    const {
      username,
      email,
      password,
      role_id,
      id_academia,
    }: {
      username: string;
      email: string;
      password: string;
      role_id: number;
      id_academia?: number;
    } = req.body;

    // Asignar full_name y phone_number por defecto
    const full_name = username;
    const phone_number = null;

    // Verifica usuario/email
    const { rows: exists } = await pool.query(
      "SELECT id FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );
    if (exists.length > 0) {
      return res.status(400).json({ message: "Username o email ya existe" });
    }

    // Hash de contraseña
    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users
        (username, email, password_hash, full_name, phone_number, role_id, id_academia)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        username,
        email,
        password_hash,
        full_name,
        phone_number,
        role_id,
        id_academia || null,
      ]
    );

    return res.status(201).json({ id: rows[0].id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en signup" });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    // Trae id_academia también
    const { rows } = await pool.query(
      "SELECT id, username, email, password_hash, role_id, id_academia FROM users WHERE email = $1",
      [email]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: "Usuario no existe" });
    }
    const user = rows[0] as { password_hash: string; id_academia: number; id: number; username: string; email: string; role_id: number };

    // Comprueba contraseña
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // Genera JWT usando config.SECRET
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
        id_academia: user.id_academia,
      },
      config.SECRET,
      { expiresIn: "24h" }
    );

    return res.json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en login" });
  }
};
