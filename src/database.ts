import { Pool } from 'pg';
import config from './config';

const pool = new Pool({
  connectionString: config.SUPABASE_DB_URL,
});

export default pool;
export { pool };
