const { Client } = require('pg');
const crypto = require('crypto');

const connectionStringEcosphere = 'postgresql://postgres:ShivangV%40010205@localhost:5432/ecosphere';

// Duplicate secure PBKDF2 hash function for CommonJS execution
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function migrate() {
  console.log('Connecting to ecosphere database for migration...');
  const client = new Client({ connectionString: connectionStringEcosphere });
  await client.connect();

  console.log('Creating users table if it does not exist...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'employee', -- 'employee' or 'admin'
      employee_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Seeding user profiles...');
  const defaultPassword = 'Password123';
  const adminPassword = 'AdminPass123';

  const seededUsers = [
    { username: 'john_doe', email: 'john@ecosphere.com', password: defaultPassword, role: 'employee', name: 'John Doe' },
    { username: 'jane_smith', email: 'jane@ecosphere.com', password: defaultPassword, role: 'employee', name: 'Jane Smith' },
    { username: 'bob_johnson', email: 'bob@ecosphere.com', password: defaultPassword, role: 'employee', name: 'Bob Johnson' },
    { username: 'alice_williams', email: 'alice@ecosphere.com', password: defaultPassword, role: 'employee', name: 'Alice Williams' },
    { username: 'admin', email: 'admin@ecosphere.com', password: adminPassword, role: 'admin', name: 'System Administrator' },
  ];

  for (const user of seededUsers) {
    const hash = hashPassword(user.password);
    
    // Insert user if they don't already exist
    await client.query(`
      INSERT INTO users (username, email, password_hash, role, employee_name)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (username) DO NOTHING
    `, [user.username, user.email, hash, user.role, user.name]);
    
    // Ensure corresponding record in employee_scores exists for normal employees
    if (user.role === 'employee') {
      await client.query(`
        INSERT INTO employee_scores (employee_name, xp, points, challenges_completed, csr_completed)
        VALUES ($1, 100, 100, 1, 1) -- seed some initial points for testing
        ON CONFLICT (employee_name) DO NOTHING
      `, [user.name]);
    }
  }

  console.log('Migration & Seeding completed successfully!');
  await client.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
