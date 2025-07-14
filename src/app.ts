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

// CORS para frontend local
const allowedOrigins = [
  'https://frontend-versus.vercel.app',
  'http://localhost:4321'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
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

export default app;
