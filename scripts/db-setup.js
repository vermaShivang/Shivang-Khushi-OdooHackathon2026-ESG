const { Client } = require('pg');

const connectionStringPostgres = 'PASTE_YOUR_URL_HERE';
const connectionStringEcosphere = 'PASTE_YOUR_URL_HERE';

async function setup() {
  console.log('Connecting to default postgres database...');
  let client = new Client({ connectionString: connectionStringPostgres });
  await client.connect();

  console.log('Checking if ecosphere database exists...');
  const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'ecosphere'");
  
  if (res.rowCount === 0) {
    console.log('Creating database ecosphere...');
    await client.query('CREATE DATABASE ecosphere');
    console.log('Database ecosphere created successfully.');
  } else {
    console.log('Database ecosphere already exists.');
  }
  await client.end();

  console.log('Connecting to ecosphere database...');
  client = new Client({ connectionString: connectionStringEcosphere });
  await client.connect();

  // Drop tables in reverse order of dependencies to ensure a clean start
  console.log('Dropping existing tables if they exist...');
  const tables = [
    'notifications', 'esg_configurations', 'rewards_redemptions', 'employee_badges',
    'employee_scores', 'compliance_issues', 'audits', 'policy_acknowledgements',
    'challenge_participations', 'challenges', 'employee_participations', 'csr_activities',
    'carbon_transactions', 'rewards', 'badges', 'esg_policies', 'environmental_goals',
    'products', 'emission_factors', 'categories', 'departments'
  ];
  for (const table of tables) {
    await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
  }

  console.log('Creating tables...');

  // 1. Departments
  await client.query(`
    CREATE TABLE departments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) NOT NULL UNIQUE,
      head VARCHAR(255) NOT NULL,
      parent_department VARCHAR(255),
      employee_count INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Active'
    )
  `);

  // 2. Categories
  await client.query(`
    CREATE TABLE categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL, -- 'CSR Activity' or 'Challenge'
      status VARCHAR(50) DEFAULT 'Active'
    )
  `);

  // 3. Emission Factors
  await client.query(`
    CREATE TABLE emission_factors (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      factor NUMERIC(10, 4) NOT NULL,
      category VARCHAR(100) NOT NULL, -- 'Purchase', 'Manufacturing', 'Expense', 'Fleet'
      unit VARCHAR(50) NOT NULL
    )
  `);

  // 4. Products (Product ESG Profile)
  await client.query(`
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      sku VARCHAR(100) UNIQUE NOT NULL,
      carbon_footprint NUMERIC(10, 2) NOT NULL,
      description TEXT
    )
  `);

  // 5. Environmental Goals
  await client.query(`
    CREATE TABLE environmental_goals (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      target_value NUMERIC(12, 2) NOT NULL,
      current_value NUMERIC(12, 2) DEFAULT 0,
      unit VARCHAR(50) NOT NULL,
      deadline DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'Active'
    )
  `);

  // 6. ESG Policies
  await client.query(`
    CREATE TABLE esg_policies (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      version VARCHAR(20) DEFAULT '1.0'
    )
  `);

  // 7. Badges
  await client.query(`
    CREATE TABLE badges (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      unlock_rule VARCHAR(255) NOT NULL, -- e.g., 'xp >= 100' or 'challenges >= 3'
      icon VARCHAR(50) NOT NULL
    )
  `);

  // 8. Rewards
  await client.query(`
    CREATE TABLE rewards (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      points_required INTEGER NOT NULL,
      stock INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Active'
    )
  `);

  // 9. Carbon Transactions
  await client.query(`
    CREATE TABLE carbon_transactions (
      id SERIAL PRIMARY KEY,
      department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
      source_type VARCHAR(50) NOT NULL, -- 'Purchase', 'Manufacturing', 'Expense', 'Fleet'
      source_amount NUMERIC(12, 2) NOT NULL,
      emission_factor_id INTEGER REFERENCES emission_factors(id) ON DELETE SET NULL,
      calculated_emissions NUMERIC(12, 2) NOT NULL,
      transaction_date DATE NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 10. CSR Activities
  await client.query(`
    CREATE TABLE csr_activities (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      description TEXT,
      points INTEGER NOT NULL
    )
  `);

  // 11. Employee Participations
  await client.query(`
    CREATE TABLE employee_participations (
      id SERIAL PRIMARY KEY,
      employee_name VARCHAR(255) NOT NULL,
      activity_id INTEGER REFERENCES csr_activities(id) ON DELETE CASCADE,
      proof_file VARCHAR(255),
      approval_status VARCHAR(50) DEFAULT 'Draft', -- 'Draft', 'Approved', 'Rejected'
      points_earned INTEGER DEFAULT 0,
      completion_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 12. Challenges
  await client.query(`
    CREATE TABLE challenges (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      description TEXT,
      xp INTEGER NOT NULL,
      difficulty VARCHAR(50) NOT NULL, -- 'Easy', 'Medium', 'Hard'
      evidence_required BOOLEAN DEFAULT FALSE,
      deadline DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'Draft' -- 'Draft', 'Active', 'Under Review', 'Completed', 'Archived'
    )
  `);

  // 13. Challenge Participations
  await client.query(`
    CREATE TABLE challenge_participations (
      id SERIAL PRIMARY KEY,
      challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
      employee_name VARCHAR(255) NOT NULL,
      progress INTEGER DEFAULT 0, -- 0 to 100%
      proof_file VARCHAR(255),
      approval_status VARCHAR(50) DEFAULT 'Draft', -- 'Draft', 'Approved', 'Rejected'
      xp_awarded INTEGER DEFAULT 0,
      completion_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 14. Policy Acknowledgements
  await client.query(`
    CREATE TABLE policy_acknowledgements (
      id SERIAL PRIMARY KEY,
      policy_id INTEGER REFERENCES esg_policies(id) ON DELETE CASCADE,
      employee_name VARCHAR(255) NOT NULL,
      acknowledged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 15. Audits
  await client.query(`
    CREATE TABLE audits (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
      auditor VARCHAR(255) NOT NULL,
      audit_date DATE NOT NULL,
      findings TEXT,
      status VARCHAR(50) DEFAULT 'Completed'
    )
  `);

  // 16. Compliance Issues
  await client.query(`
    CREATE TABLE compliance_issues (
      id SERIAL PRIMARY KEY,
      audit_id INTEGER REFERENCES audits(id) ON DELETE CASCADE,
      severity VARCHAR(50) NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
      description TEXT NOT NULL,
      owner VARCHAR(255) NOT NULL,
      due_date DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'Open' -- 'Open', 'Resolved', 'Flagged'
    )
  `);

  // 17. Employee Scores
  await client.query(`
    CREATE TABLE employee_scores (
      id SERIAL PRIMARY KEY,
      employee_name VARCHAR(255) UNIQUE NOT NULL,
      xp INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0,
      challenges_completed INTEGER DEFAULT 0,
      csr_completed INTEGER DEFAULT 0
    )
  `);

  // 18. Employee Badges
  await client.query(`
    CREATE TABLE employee_badges (
      id SERIAL PRIMARY KEY,
      employee_name VARCHAR(255) NOT NULL,
      badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
      awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_employee_badge UNIQUE (employee_name, badge_id)
    )
  `);

  // 19. Rewards Redemptions
  await client.query(`
    CREATE TABLE rewards_redemptions (
      id SERIAL PRIMARY KEY,
      reward_id INTEGER REFERENCES rewards(id) ON DELETE CASCADE,
      employee_name VARCHAR(255) NOT NULL,
      redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      points_spent INTEGER NOT NULL
    )
  `);

  // 20. ESG Configurations
  await client.query(`
    CREATE TABLE esg_configurations (
      id SERIAL PRIMARY KEY,
      key VARCHAR(100) UNIQUE NOT NULL,
      value VARCHAR(255) NOT NULL
    )
  `);

  // 21. Notifications
  await client.query(`
    CREATE TABLE notifications (
      id SERIAL PRIMARY KEY,
      message TEXT NOT NULL,
      type VARCHAR(50) NOT NULL, -- 'Compliance', 'Approval', 'Policy', 'Badge'
      status VARCHAR(50) DEFAULT 'Unread',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Tables created successfully.');

  console.log('Seeding initial data...');

  // Seed Departments
  await client.query(`
    INSERT INTO departments (name, code, head, parent_department, employee_count, status) VALUES
    ('Engineering', 'ENG', 'Dr. Sarah Connor', NULL, 120, 'Active'),
    ('Operations', 'OPS', 'Marcus Wright', NULL, 85, 'Active'),
    ('Human Resources', 'HR', 'Grace Jones', NULL, 15, 'Active'),
    ('Sales & Marketing', 'MKT', 'Kyle Reese', NULL, 40, 'Active')
  `);

  // Seed Categories
  await client.query(`
    INSERT INTO categories (name, type, status) VALUES
    ('E-Waste Recycling', 'CSR Activity', 'Active'),
    ('Reforestation Drive', 'CSR Activity', 'Active'),
    ('Energy Efficiency Challenge', 'Challenge', 'Active'),
    ('Zero Waste Challenge', 'Challenge', 'Active'),
    ('ESG Policy Training', 'Challenge', 'Active')
  `);

  // Seed Emission Factors
  await client.query(`
    INSERT INTO emission_factors (name, factor, category, unit) VALUES
    ('Electricity (Grid)', 0.8500, 'Expense', 'kg CO2e/kWh'),
    ('Natural Gas', 2.0300, 'Expense', 'kg CO2e/m3'),
    ('Petrol (Fleet Vehicles)', 2.3100, 'Fleet', 'kg CO2e/liter'),
    ('Diesel (Fleet Vehicles)', 2.6800, 'Fleet', 'kg CO2e/liter'),
    ('Raw Steel Sourcing', 1.8500, 'Manufacturing', 'kg CO2e/kg'),
    ('Recycled Aluminum Sourcing', 0.6000, 'Manufacturing', 'kg CO2e/kg'),
    ('Air Travel (Short Haul)', 0.1500, 'Purchase', 'kg CO2e/km'),
    ('Air Travel (Long Haul)', 0.1100, 'Purchase', 'kg CO2e/km')
  `);

  // Seed Products
  await client.query(`
    INSERT INTO products (name, sku, carbon_footprint, description) VALUES
    ('EcoSphere Sensor Node v1', 'SKU-ECO-001', 12.40, 'Internet-connected environment observing device'),
    ('EcoSphere Gateway Pro', 'SKU-ECO-002', 45.80, 'Industrial grade edge processing unit'),
    ('Carbon Pod Solar Battery', 'SKU-SOL-100', 89.20, 'High-capacity lithium battery with solar controller')
  `);

  // Seed Environmental Goals
  await client.query(`
    INSERT INTO environmental_goals (title, target_value, current_value, unit, deadline, status) VALUES
    ('Reduce Carbon Footprint by 15%', 50000.00, 12450.00, 'kg CO2e', '2026-12-31', 'Active'),
    ('Switch Fleet to 50% Electric Vehicles', 50.00, 20.00, '% EVs', '2027-06-30', 'Active'),
    ('Zero Waste to Landfill Initiative', 100.00, 68.00, '% Recycled', '2026-10-15', 'Active')
  `);

  // Seed ESG Policies
  await client.query(`
    INSERT INTO esg_policies (title, content, version) VALUES
    ('Corporate Carbon Travel Policy', 'Employees are requested to prefer rail travel for all distances under 300km. Business class air travel is strictly restricted to flights longer than 6 hours.', '1.2'),
    ('Sustainable Sourcing & Green Procurement', 'All suppliers must declare their Scope 1 & 2 carbon footprints. Preference is given to suppliers certified under ISO 14001 or equivalent environmental management protocols.', '2.0'),
    ('Information Security & ESG Governance Code', 'Protects company and customer data with robust encryption. Sets rules on transparency, anti-corruption, and code of conduct compliance.', '1.0')
  `);

  // Seed Badges
  await client.query(`
    INSERT INTO badges (name, description, unlock_rule, icon) VALUES
    ('Carbon Sentinel', 'Awarded for completing 3 energy or carbon-related challenges', 'challenges >= 3', 'shield'),
    ('Eco Pioneer', 'Awarded for accumulating 100 XP or points', 'xp >= 100', 'sprout'),
    ('Compliance Guardian', 'Acknowledge all policies and resolve at least one compliance issue', 'policies_acknowledged >= 3', 'lock')
  `);

  // Seed Rewards
  await client.query(`
    INSERT INTO rewards (name, description, points_required, stock, status) VALUES
    ('Zero-Waste Stainless Steel Flask', 'Eco-friendly insulated water flask with EcoSphere logo.', 150, 45, 'Active'),
    ('Solar Powered Phone Charger', 'Portable solar charger built from recycled ocean plastic.', 300, 12, 'Active'),
    ('Tree Plantation Certificate', 'A tree will be planted in your name in the Himalayan reforestation belt.', 80, 200, 'Active')
  `);

  // Seed ESG Configurations
  await client.query(`
    INSERT INTO esg_configurations (key, value) VALUES
    ('weight_environmental', '40'),
    ('weight_social', '30'),
    ('weight_governance', '30'),
    ('auto_emission_calculation', 'true'),
    ('evidence_requirement', 'true'),
    ('badge_auto_award', 'true')
  `);

  // Seed initial employee scores (for Leaderboard)
  await client.query(`
    INSERT INTO employee_scores (employee_name, xp, points, challenges_completed, csr_completed) VALUES
    ('John Doe', 250, 250, 4, 3),
    ('Jane Smith', 180, 180, 3, 2),
    ('Bob Johnson', 110, 110, 2, 1),
    ('Alice Williams', 90, 90, 1, 2)
  `);

  // Seed initial carbon transactions
  await client.query(`
    INSERT INTO carbon_transactions (department_id, source_type, source_amount, emission_factor_id, calculated_emissions, transaction_date, notes) VALUES
    (1, 'Expense', 12000, 1, 10200.00, '2026-06-15', 'Engineering server room monthly grid electricity usage'),
    (2, 'Fleet', 800, 3, 1848.00, '2026-06-20', 'Operations logistics petrol delivery van mileage'),
    (2, 'Manufacturing', 5000, 5, 9250.00, '2026-06-22', 'Production batch raw steel sourcing footprint'),
    (4, 'Purchase', 15000, 7, 2250.00, '2026-06-28', 'Sales team flight travel for annual client summit')
  `);

  // Seed CSR activities
  await client.query(`
    INSERT INTO csr_activities (title, category_id, description, points) VALUES
    ('Community Tree Planting Campaign', 2, 'Join us to plant 100 saplings in the city park.', 50),
    ('Old Office Electronics Collection', 1, 'Bring in old chargers, phones, and laptops for certified recycling.', 30)
  `);

  // Seed audits and compliance issues
  await client.query(`
    INSERT INTO audits (title, department_id, auditor, audit_date, findings, status) VALUES
    ('Annual Environmental Safety Audit', 2, 'Greenfield Standards Inc.', '2026-05-10', 'Minor hazardous waste storage labelling discrepancies.', 'Completed')
  `);

  await client.query(`
    INSERT INTO compliance_issues (audit_id, severity, description, owner, due_date, status) VALUES
    (1, 'Medium', 'E-Waste storage drums require immediate weather protection covering.', 'Marcus Wright', '2026-06-30', 'Open'),
    (1, 'Low', 'Update fire exit signs in secondary manufacturing warehouse.', 'Grace Jones', '2026-08-15', 'Open')
  `);

  console.log('Seeding completed successfully!');
  await client.end();
}

setup().catch(err => {
  console.error('Database setup failed:', err);
  process.exit(1);
});
