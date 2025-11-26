import dotenv from 'dotenv';
dotenv.config();

export default {
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_DATABASE: process.env.DB_DATABASE || '',
  JWT_SECRET: process.env.JWT_SECRET || 'defaultsecret',
  SUPABASE_DB_URL: process.env.SUPABASE_DB_URL || ''
};
