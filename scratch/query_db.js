const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          const key = trimmed.substring(0, idx).trim();
          const val = trimmed.substring(idx + 1).trim();
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.PGUSER || 'postgres'}:${encodeURIComponent(process.env.PGPASSWORD || '')}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'ecosphere'}`;

async function run() {
  const client = new Client({ connectionString });
  await client.connect();
  
  console.log("Leaderboard scores:");
  const res = await client.query("SELECT * FROM employee_scores ORDER BY xp DESC");
  console.log(res.rows);
  
  await client.end();
}

run();
