import express from "express";
import morgan from "morgan";
import cors from "cors";
import authRouter from "./router/auth.routes";
import userRoutes from './router/users.routes';
import preguntaRoutes from "./router/preguntas.routes";
import encargoRoutes from './router/encargos.routes';
import postRouter from "./router/post.routes";
import cursoRoutes from './router/cursos.routes';          // 👈 NUEVO
import temaRoutes from './router/temas.routes';            // 👈 NUEVO
import asignaturaRoutes from './router/asignaturas.routes';// 👈 NUEVO
import academiasRouter from './router/academias.routes';
import estadosRouter from './router/estados.routes';
import config from "./config";

const app = express();

// CORS para desarrollo - permitir localhost
const allowedOrigins = [
  'https://frontend-versus.vercel.app',
  'https://frontend-test-sandy-mu.vercel.app',
  'https://preguntas-test.versuselearning.com',
  'http://localhost:4321',
  'http://127.0.0.1:4321', // Añadir también 127.0.0.1
  'http://localhost:3000'   // Por si acaso usa otro puerto
];

app.use(cors({
  origin: (origin, callback) => {
    // Durante desarrollo, permitir localhost y dominios de vercel
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.includes('localhost') ||
      origin.endsWith('.vercel.app') // Permitir cualquier despliegue en Vercel
    ) {
      callback(null, true);
    } else {
      console.log('🚫 CORS bloqueado para origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.set("port", config.PORT);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Rutas principales
app.use('/api', userRoutes);
app.use("/api/auth", authRouter);
app.use("/api/preguntas", preguntaRoutes);
app.use("/api/post", postRouter);
app.use("/api/encargos", encargoRoutes);
app.use("/api/cursos", cursoRoutes);
app.use("/api/temas", temaRoutes);
app.use("/api/asignaturas", asignaturaRoutes);
app.use('/api/academias', academiasRouter);
app.use('/api/estados', estadosRouter);

// Endpoint para poblar datos de ejemplo (SOLO PARA DESARROLLO)
app.post('/api/seed', async (_req, res) => {
  try {
    const { pool } = await import('./database');

    // Insertar academias
    await pool.query(`
      INSERT INTO academias (nombre_academia, color) VALUES 
      ('Academia Primaria', '#FF6B6B'),
      ('Academia Secundaria', '#4ECDC4'),
      ('Academia Superior', '#45B7D1')
      ON CONFLICT (nombre_academia) DO NOTHING
    `);

    // Insertar estados
    await pool.query(`
      INSERT INTO estados (nombre_estado) VALUES 
      ('Activo'),
      ('Inactivo'),
      ('Completado'),
      ('Pendiente')
      ON CONFLICT (nombre_estado) DO NOTHING
    `);

    // Insertar asignaturas
    await pool.query(`
      INSERT INTO asignaturas (codigo_asignatura, nombre_asignatura) VALUES 
      ('MAT', 'Matemáticas'),
      ('LEN', 'Lenguaje'),
      ('CIE', 'Ciencias'),
      ('HIS', 'Historia'),
      ('GEO', 'Geografía')
      ON CONFLICT (codigo_asignatura) DO NOTHING
    `);

    // Insertar cursos
    await pool.query(`
      INSERT INTO cursos (nombre_curso, id_academia) VALUES 
      ('Curso Básico', 1),
      ('Curso Intermedio', 1),
      ('Curso Avanzado', 1),
      ('Curso Básico', 2),
      ('Curso Intermedio', 2),
      ('Curso Superior', 3)
      ON CONFLICT (nombre_curso, id_academia) DO NOTHING
    `);

    // Insertar temas
    await pool.query(`
      INSERT INTO temas (codigo_tema, nombre_tema, id_curso_tema, id_asignatura) VALUES 
      ('MAT01', 'Números Naturales', 1, 1),
      ('MAT02', 'Operaciones Básicas', 1, 1),
      ('LEN01', 'Lectura Comprensiva', 1, 2),
      ('LEN02', 'Gramática', 2, 2),
      ('CIE01', 'El Sistema Solar', 2, 3),
      ('HIS01', 'Historia Antigua', 4, 4)
      ON CONFLICT (codigo_tema) DO NOTHING
    `);

    // Insertar usuarios de ejemplo (con contraseñas hasheadas)
    await pool.query(`
      INSERT INTO users (username, email, password, id_academia, role) VALUES 
      ('admin', 'admin@academia.com', '$2a$10$example.hash.for.admin', 1, 'admin'),
      ('profesor1', 'profesor1@academia.com', '$2a$10$example.hash.for.prof', 1, 'profesor'),
      ('profesor2', 'profesor2@academia.com', '$2a$10$example.hash.for.prof2', 2, 'profesor'),
      ('estudiante1', 'estudiante1@academia.com', '$2a$10$example.hash.for.est', 1, 'estudiante')
      ON CONFLICT (email) DO NOTHING
    `);

    // Insertar encargos de ejemplo
    await pool.query(`
      INSERT INTO encargos (nombre_encargo, descripcion_encargo, numero_preguntas_encargo, user_id, id_academia, id_curso, id_asignatura, id_tema) VALUES 
      ('Encargo Matemáticas Básicas', 'Preguntas sobre números naturales y operaciones básicas', 10, 2, 1, 1, 1, 1),
      ('Encargo Lenguaje Avanzado', 'Análisis de textos literarios', 15, 2, 1, 2, 2, 3),
      ('Encargo Ciencias Naturales', 'Sistema solar y planetas', 12, 3, 2, 5, 3, 5),
      ('Encargo Historia Antigua', 'Civilizaciones antiguas', 8, 3, 2, 4, 4, 6)
      ON CONFLICT DO NOTHING
    `);

    res.json({ message: 'Datos de ejemplo insertados correctamente' });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({ error: 'Error al poblar la base de datos' });
  }
});

export default app;
