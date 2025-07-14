import { JwtPayload } from "jsonwebtoken";

export interface User {
  username: { type: string; required: true };
  email: { type: string; required: true };
  password: String;
}

export interface Post {
  title: string;
  post: string;
  author: string | JwtPayload | null;
}

export interface EncargoPreguntaRow {
  enunciado_pregunta: string;
  opcion1_pregunta: string;
  opcion2_pregunta: string;
  opcion3_pregunta: string;
  opcion4_pregunta: string;
  respuesta_correcta_pregunta: string;
  explicacion_pregunta: string;
  codigo_tema: string;
  codigo_asignatura: string;
}
