// src/controller/encargos.controller.ts
import { Request, Response } from "express";
import { pool } from "../database";
import type { PoolClient } from "pg";
import * as ExcelJS from "exceljs";
import { EncargoPreguntaRow } from "../interface/interface";
import path from "path";

// GET /encargos/:id_encargo/:pid/:code
// Genera un Excel con las preguntas del encargo y de sus hijos (sub-encargos)
export const downloadEncargoPreguntasExcel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const idEncargo = Number(req.params.id_encargo);
    const startPid = Number(req.params.pid);
    const startCodigo = Number(decodeURIComponent(req.params.code));

    if (isNaN(idEncargo) || isNaN(startPid) || isNaN(startCodigo)) {
      res.status(400).json({ message: "Parámetros inválidos" });
      return;
    }

    // Incluye preguntas de encargo y de hijos (primer nivel)
    const sql = `
      SELECT
        p.enunciado_pregunta,
        p.opcion1_pregunta, p.opcion2_pregunta,
        p.opcion3_pregunta, p.opcion4_pregunta,
        p.respuesta_correcta_pregunta,
        p.explicacion_pregunta,
        t.codigo_tema,
        a.codigo_asignatura
      FROM preguntas p
      JOIN encargos e    ON p.id_encargo    = e.id_encargo
      JOIN temas t       ON e.id_tema        = t.id_tema
      JOIN asignaturas a ON e.id_asignatura = a.id_asignatura
      WHERE e.id_encargo = $1
         OR e.encargo_padre_id = $1
      ORDER BY e.id_encargo, p.id_pregunta
    `;
    const { rows } = await pool.query(sql, [idEncargo]);

    if (!rows.length) {
      res.status(404).json({ message: "No hay preguntas para este encargo ni sus hijos" });
      return;
    }

    const templatePath = path.join(__dirname, "../templates/cabeceras.xlsx");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      res.status(500).json({ message: "Plantilla de Excel inválida" });
      return;
    }

    // Rellenar filas a partir de la segunda
    rows.forEach((r: EncargoPreguntaRow, i: number) => {
      const rowIndex = 2 + i;
      const row = worksheet.getRow(rowIndex);

      row.getCell(1).value = startPid + i;         // IdPregunta
      row.getCell(2).value = startCodigo + i;      // CodigoPregunta
      row.getCell(3).value = r.enunciado_pregunta; // Pregunta
      row.getCell(4).value = r.opcion1_pregunta;   // R1
      row.getCell(5).value = r.opcion2_pregunta;   // R2
      row.getCell(6).value = r.opcion3_pregunta;   // R3
      row.getCell(7).value = r.opcion4_pregunta;   // R4
      row.getCell(9).value = r.respuesta_correcta_pregunta; // RespuestaCorrecta
      row.getCell(10).value = r.explicacion_pregunta;      // JustificacionTexto

      // IdTema y Idsub-Tema (código de tema)
      row.getCell(12).value = r.codigo_tema;      // IdTema
      row.getCell(13).value = r.codigo_tema;      // Idsub-Tema

      row.getCell(14).value = "FALSE";           // ModificadoOrigen
      row.getCell(16).value = "FALSE";           // Revisión
      row.getCell(20).value = r.codigo_asignatura; // IdAsignatura

      row.commit();
    });

    res
      .status(200)
      .setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
      .setHeader(
        "Content-Disposition",
        `attachment; filename="encargo_${idEncargo}.xlsx"`
      );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generando Excel de encargo:", error);
    res.status(500).json({ message: "Error al generar el Excel" });
  }
};

// Crear un nuevo encargo o subencargo
export const createEncargo = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      nombre_encargo,
      descripcion_encargo,
      user_id,
      numero_preguntas_encargo,
      encargo_padre_id,
      id_tema,
      id_asignatura,
      id_academia
    }: {
      nombre_encargo: string;
      descripcion_encargo?: string;
      user_id: number;
      numero_preguntas_encargo?: number;
      encargo_padre_id?: number;
      id_tema?: number;
      id_asignatura?: number;
      id_academia?: number;
    } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO encargos
         (nombre_encargo, descripcion_encargo, user_id,
          numero_preguntas_encargo, encargo_padre_id,
          id_tema, id_asignatura, id_academia)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id_encargo`,
      [
        nombre_encargo,
        descripcion_encargo || null,
        user_id,
        numero_preguntas_encargo || 0,
        encargo_padre_id || null,
        id_tema || null,
        id_asignatura || null,
        id_academia || null
      ]
    );

    return res.status(201).json({ id: rows[0].id_encargo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al crear encargo" });
  }
};

// Listar todos los encargos
export const getEncargos = async (_req: Request, res: Response): Promise<Response> => {
  const sql = `
    SELECT 
      e.*, e.id_estado_encargo,
      COALESCE((
        SELECT COUNT(*) 
        FROM preguntas p 
        WHERE p.id_encargo = e.id_encargo
      ), 0) AS preguntas_actuales
    FROM encargos e
    ORDER BY e.id_encargo
  `;
  try {
    const { rows } = await pool.query(sql);
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener encargos" });
  }
};

// Obtener encargos de un usuario, incluyendo contador de preguntas actuales
export const getEncargosByUser = async (req: Request, res: Response): Promise<Response> => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ message: "userId inválido" });

  const sql = `
    SELECT
      e.*, e.id_estado_encargo,
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM encargos c2
          WHERE c2.encargo_padre_id = e.id_encargo
        ) THEN (
          SELECT COALESCE(SUM(cnt), 0) FROM (
            SELECT COUNT(*) AS cnt
            FROM preguntas p
            WHERE p.id_encargo IN (
              SELECT id_encargo
              FROM encargos c3
              WHERE c3.encargo_padre_id = e.id_encargo
            )
            GROUP BY p.id_encargo
          ) AS sub
        ) ELSE (
          SELECT COUNT(*)
          FROM preguntas p
          WHERE p.id_encargo = e.id_encargo
        )
      END AS preguntas_actuales
    FROM encargos e
    WHERE e.user_id = $1
    ORDER BY e.id_encargo
  `;

  try {
    const { rows } = await pool.query(sql, [userId]);
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener encargos del usuario" });
  }
};

// Obtener encargo por ID
export const getEncargoById = async (req: Request, res: Response): Promise<Response> => {
  const id = Number(req.params.id);
  try {
    const { rows } = await pool.query(
      "SELECT * FROM encargos WHERE id_encargo = $1",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Encargo no encontrado" });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al buscar encargo" });
  }
};

// Listar sub-encargos de un padre
export const getSubencargos = async (req: Request, res: Response): Promise<Response> => {
  const parentId = Number(req.params.id);
  if (isNaN(parentId)) return res.status(400).json({ message: "ID de padre inválido" });
  try {
    const { rows } = await pool.query(
      "SELECT * FROM encargos WHERE encargo_padre_id = $1",
      [parentId]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al obtener sub-encargos" });
  }
};

// Actualizar un encargo completo
export const updateEncargo = async (req: Request, res: Response): Promise<Response> => {
  const id = Number(req.params.id);
  try {
    const {
      nombre_encargo,
      descripcion_encargo,
      user_id,
      numero_preguntas_encargo,
      encargo_padre_id,
      id_tema,
      id_asignatura,
      id_academia
    }: {
      nombre_encargo: string;
      descripcion_encargo?: string;
      user_id: number;
      numero_preguntas_encargo?: number;
      encargo_padre_id?: number;
      id_tema?: number;
      id_asignatura?: number;
      id_academia?: number;
    } = req.body;

    const result = await pool.query(
      `UPDATE encargos SET
         nombre_encargo = $1,
         descripcion_encargo = $2,
         user_id = $3,
         numero_preguntas_encargo = $4,
         encargo_padre_id = $5,
         id_tema = $6,
         id_asignatura = $7,
         id_academia = $8
       WHERE id_encargo = $9`,
      [
        nombre_encargo,
        descripcion_encargo || null,
        user_id,
        numero_preguntas_encargo || 0,
        encargo_padre_id || null,
        id_tema || null,
        id_asignatura || null,
        id_academia || null,
        id
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Encargo no encontrado" });
    }
    return res.json({ message: "Encargo actualizado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al actualizar encargo" });
  }
};

// Eliminar un encargo
export const deleteEncargo = async (req: Request, res: Response): Promise<Response> => {
  const id = Number(req.params.id);
  try {
    const result = await pool.query(
      "DELETE FROM encargos WHERE id_encargo = $1",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Encargo no encontrado" });
    }
    return res.json({ message: "Encargo eliminado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al eliminar encargo" });
  }
};

// Cambia el estado de un encargo (hijo o principal) y propaga la activación/cierre al padre
export const patchEstadoEncargo = async (
  req: Request<{ id: string; id_estado_encargo: string }>,
  res: Response
): Promise<Response> => {
  const id_encargo = Number(req.params.id);
  const id_estado_encargo = Number(req.params.id_estado_encargo);

  if (isNaN(id_encargo) || isNaN(id_estado_encargo)) {
    return res.status(400).json({ message: "IDs inválidos" });
  }

  let conn: PoolClient | null = null;
  try {
    conn = await pool.connect();
    await conn.query('BEGIN');

    // 1) Verificamos que el estado exista
    const { rows: stRows } = await conn.query(
      "SELECT id_estado FROM estados WHERE id_estado = $1",
      [id_estado_encargo]
    );
    if (stRows.length === 0) {
      await conn.query('ROLLBACK');
      return res.status(400).json({ message: "Estado no válido" });
    }

    // 2) Actualizamos el encargo
    const upd = await conn.query(
      "UPDATE encargos SET id_estado_encargo = $1 WHERE id_encargo = $2",
      [id_estado_encargo, id_encargo]
    );
    if (upd.rowCount === 0) {
      await conn.query('ROLLBACK');
      return res.status(404).json({ message: "Encargo no encontrado" });
    }

    // 3) Obtenemos el posible padre
    const { rows: parentRows } = await conn.query(
      "SELECT encargo_padre_id FROM encargos WHERE id_encargo = $1",
      [id_encargo]
    );
    const parentId = (parentRows[0]?.encargo_padre_id as number) || null;

    let padreActualizado = false;
    // 4) Si hay padre, ajustamos su estado según el nuevo estado del hijo
    if (parentId) {
      if (id_estado_encargo === 1) {
        // Reactivar el padre cuando se active cualquier hijo
        await conn.query(
          "UPDATE encargos SET id_estado_encargo = 1 WHERE id_encargo = $1",
          [parentId]
        );
        padreActualizado = true;
      } else if (id_estado_encargo === 2) {
        // Cerrar padre solo si no quedan hijos activos
        const { rows: pendientesRows } = await conn.query(
          `SELECT COUNT(*) AS pendientes
           FROM encargos
           WHERE encargo_padre_id = $1 AND id_estado_encargo <> 2`,
          [parentId]
        );
        const pendientes = Number(pendientesRows[0].pendientes);
        if (pendientes === 0) {
          await conn.query(
            "UPDATE encargos SET id_estado_encargo = 2 WHERE id_encargo = $1",
            [parentId]
          );
          padreActualizado = true;
        }
      }
    }

    await conn.query('COMMIT');
    return res.json({
      message: "Estado actualizado correctamente",
      encargoId: id_encargo,
      nuevoEstadoId: id_estado_encargo,
      padreActualizado
    });
  } catch (error) {
    if (conn) await conn.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({ message: "Error al actualizar estado del encargo" });
  } finally {
    if (conn) conn.release();
  }
};