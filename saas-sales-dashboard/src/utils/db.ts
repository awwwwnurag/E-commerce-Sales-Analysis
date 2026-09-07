import { Pool } from 'pg';

let pool: Pool;

const connectionString = process.env.DATABASE_URL;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString,
    ssl: connectionString?.includes('supabase') || connectionString?.includes('localhost') === false
      ? { rejectUnauthorized: false }
      : undefined,
  });
} else {
  // Prevent multiple pools in development hot reload
  if (!(global as any).pgPool) {
    (global as any).pgPool = new Pool({
      connectionString,
      ssl: connectionString?.includes('supabase') || (connectionString && connectionString.includes('localhost') === false)
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }
  pool = (global as any).pgPool;
}

export { pool };
export default pool;
