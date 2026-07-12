import { Pool } from 'pg';

let pool;

if (!global._postgresPool) {
  global._postgresPool = new Pool({
    connectionString: 'postgresql://postgres:ShivangV%40010205@localhost:5432/ecosphere',
    max: 20, // Max connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}
pool = global._postgresPool;

export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Log queries in dev for debug visibility
    if (process.env.NODE_ENV !== 'production') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', error, 'Query:', text);
    throw error;
  }
}

export async function getClient() {
  const client = await pool.connect();
  return client;
}
