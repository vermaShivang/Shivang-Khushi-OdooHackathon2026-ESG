# EcoSphere: ESG Carbon Observatory & Management Platform

Welcome to **EcoSphere**, a gamified ESG Observatory, carbon accounting, and regulatory compliance platform. Designed for modern corporate infrastructure, it tracks emission thresholds (Scope 1, 2, & 3), manages employee social impact campaigns (CSR), monitors regulatory audits/violations, and incentivizes carbon mitigation using dynamic gamified challenges and a certification engine.

---

## 🚀 Key Features

1. **Living Systems Design & Orb**: Canvas-rendered live particle system that shifts speed, attraction, and hue during real-time database transactions, representing corporate carbon density and ESG scores.
2. **Secure PBKDF2/AES Authentication**: Credential-based user authentication using cryptographic PBKDF2 hashes (10,000 iterations) and AES-256-CBC encrypted stateless session cookies.
3. **Pillars Analytics**:
   - **Environmental**: Carbon ledger with automatic conversions of fuel/electricity based on EPA and UK DESNZ 2026 guidelines.
   - **Social**: Logger for employee diversity metrics, training completion, and CSR activities.
   - **Governance**: Active compliance checks flagging overdue audits, tracking regulatory policies, and handling incident warnings.
4. **Interactive Dashboard Charts**:
   - **ESG Distribution Bar Chart**: Displays dynamic graphic representation of Environmental, Social, and Governance pillar scores.
   - **Department Performance Matrix**: A horizontal comparative bar graph measuring the Total ESG score for each department (ENG, OPS, HR, MKT).
5. **AI Gamification & Eco-Quest**:
   - **Gemini AI Quest Architect**: Dynamically generated carbon reduction challenges based on user context using Gemini API.
   - **Gemini AI Quiz Synthesizer**: Custom corporate quizzes (Scope 1/2/3, climate metrics) generating 10 XP & 10 CSR Points per correct answer.
   - **Pillar Leaderboards & Shop**: Redeem earned points for eco-friendly incentives (bus passes, coffee vouchers).
6. **Observed Offset Simulator (Novelty)**:
   - What-if sliders simulating transition to renewable energy, travel cuts, and supply chain efficiencies.
   - Live predictive roll-up charts displaying the estimated drop in carbon footprint and simulated shifts in ESG scores.
7. **System Telemetry & API Health Dashboard**:
   - Live API ping monitors showing real-time endpoint latency (in milliseconds) and uptime metrics.
   - Session caches displaying currently authenticated users, IP addresses, and device/browser details.
   - Server metrics showing CPU core usage, allocated memory, and active PostgreSQL connection counts.
8. **Printable ESG Audits & Achievement Certificates**:
   - High-contrast `@media print` CSS formats printable certificates and custom corporate reports, cleanly omitting headers, buttons, and navigation elements.
   - Secure Blob-based CSV exports preventing field corruptions from commas or quotations.

---

## 🛠️ Tech Stack
- **Frontend/Backend**: Next.js 15 (App Router, React 19)
- **Database**: PostgreSQL (local pool via `node-postgres`)
- **AI Engine**: Gemini API (`gemini-flash-latest`)
- **Crypto & Security**: PBKDF2, AES-256-CBC, Secure HttpOnly Cookie

---

## 💻 Local Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** (running locally or on the cloud)

### 2. Configure Environment Variables
Create a unified **`.env`** file inside the root `/ecosphere` directory:
```env
# PostgreSQL Connection Configuration
PGUSER=postgres
PGPASSWORD=your_postgres_password
PGHOST=localhost
PGPORT=5432
PGDATABASE=ecosphere

# Gemini API Integration
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Schema Migrations & Seeding
This creates the full schema (21 tables) and seeds real-world data (UK DESNZ factors, default user accounts, departments):
```bash
# Seed initial categories, factors, and goals
node scripts/db-setup.js

# Setup users table, pbkdf2 profiles, and initial XP balances
node scripts/db-auth-migration.js
```

### 5. Run the Local Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser.

---

## 🔑 Default Accounts (Seeded Data)
You can log into the platform using these pre-registered user accounts:

| Username | Password | Role | Employee Name | Description |
| :--- | :--- | :--- | :--- | :--- |
| `john_doe` | `Password123` | `employee` | John Doe | Engineering team member |
| `jane_smith` | `Password123` | `employee` | Jane Smith | Operations manager |
| `admin` | `AdminPass123` | `admin` | System Administrator | Full access to Admin Panel |

---

## ☁️ Cloud Deployment Guide

To deploy **EcoSphere** to a production cloud environment, follow these steps:

### Phase A: Cloud Database Provisioning (e.g., Neon or Supabase)
1. Register for a free Serverless PostgreSQL database on **Neon** (`https://neon.tech`) or **Supabase** (`https://supabase.com`).
2. Create a new database named `ecosphere` and copy the connection string.
3. Replace local connection settings in your environment variables with the secure cloud connection string:
   ```env
   DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-host.pooler.us-east-2.aws.neon.tech/ecosphere?sslmode=require
   ```

### Phase B: Frontend & API Hosting (Vercel)
1. Push this workspace codebase to a secure repository on **GitHub**.
2. Sign into **Vercel** (`https://vercel.com`) and import your repository.
3. Under **Environment Variables**, configure the production keys:
   - `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, `PGDATABASE` (or provide the unified `DATABASE_URL` if supported by your setup).
   - `GEMINI_API_KEY` (containing your generative AI token).
4. Click **Deploy**. Vercel will build the Next.js bundle and host the application globally on an HTTPS endpoint.

### Phase C: Seeding the Cloud Database
To run setup scripts on your cloud database:
1. Temporarily point your local environment variables in `.env` to the cloud URL.
2. Run the seeding commands from your terminal:
   ```bash
   node scripts/db-setup.js
   node scripts/db-auth-migration.js
   ```
3. Revert your local environment variables back to localhost to prevent accidental modification of production data.
