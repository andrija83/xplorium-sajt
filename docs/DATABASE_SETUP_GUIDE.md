# Database Setup Guide

Quick guide to set up your PostgreSQL database for the Xplorium admin panel.

---

## Option 1: Vercel Postgres (Recommended - Easiest)

### Why Vercel Postgres?
- ✅ Seamless Vercel deployment integration
- ✅ Automatic backups
- ✅ Connection pooling built-in
- ✅ Free tier available
- ✅ Zero configuration needed

### Setup Steps

1. **Create Database on Vercel**
   ```bash
   # Visit: https://vercel.com/dashboard
   # 1. Select your project (or create one)
   # 2. Go to "Storage" tab
   # 3. Click "Create Database"
   # 4. Select "Postgres"
   # 5. Choose a region (closest to your users)
   # 6. Click "Create"
   ```

2. **Get Connection Strings**
   - After creation, Vercel will show you the connection strings
   - Click "Show .env.local" tab
   - Copy all the values

3. **Update Your `.env.local`**
   ```bash
   # Replace these lines in .env.local:
   DATABASE_URL="your-postgres-url-here"
   POSTGRES_PRISMA_URL="your-prisma-url-here"
   POSTGRES_URL_NON_POOLING="your-non-pooling-url-here"
   ```

4. **Run Migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run db:seed
   ```

5. **Verify**
   ```bash
   npm run db:studio
   # Browser will open showing your database tables
   ```

---

## Option 2: Local PostgreSQL (Development)

### Why Local PostgreSQL?
- ✅ Full control over your data
- ✅ Works offline
- ✅ Free
- ✅ Good for development

### Setup Steps

#### Windows

1. **Install PostgreSQL**
   ```powershell
   # Download from: https://www.postgresql.org/download/windows/
   # Or use chocolatey:
   choco install postgresql
   ```

2. **Start PostgreSQL Service**
   ```powershell
   # Search for "Services" in Windows
   # Find "postgresql-x64-15" (version may vary)
   # Right-click → Start
   ```

3. **Create Database**
   ```powershell
   # Open Command Prompt as Administrator
   psql -U postgres
   CREATE DATABASE xplorium;
   \q
   ```

4. **Update `.env.local`**
   ```bash
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/xplorium"
   ```

5. **Run Migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run db:seed
   ```

#### macOS

1. **Install PostgreSQL**
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **Create Database**
   ```bash
   createdb xplorium
   ```

3. **Update `.env.local`**
   ```bash
   DATABASE_URL="postgresql://username@localhost:5432/xplorium"
   ```

4. **Run Migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run db:seed
   ```

#### Linux

1. **Install PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib

   # Fedora/RHEL
   sudo dnf install postgresql-server postgresql-contrib
   ```

2. **Start PostgreSQL**
   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

3. **Create Database**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE xplorium;
   CREATE USER xplorium_user WITH PASSWORD 'yourpassword';
   GRANT ALL PRIVILEGES ON DATABASE xplorium TO xplorium_user;
   \q
   ```

4. **Update `.env.local`**
   ```bash
   DATABASE_URL="postgresql://xplorium_user:yourpassword@localhost:5432/xplorium"
   ```

5. **Run Migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run db:seed
   ```

---

## Option 3: Neon (Serverless Postgres)

### Why Neon?
- ✅ Serverless PostgreSQL
- ✅ Generous free tier
- ✅ Instant setup
- ✅ Automatic scaling

### Setup Steps

1. **Create Account**
   - Visit: https://neon.tech
   - Sign up with GitHub

2. **Create Database**
   - Click "Create Project"
   - Choose region
   - Copy connection string

3. **Update `.env.local`**
   ```bash
   DATABASE_URL="your-neon-connection-string"
   ```

4. **Run Migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run db:seed
   ```

---

## Option 4: Supabase (Open Source Firebase Alternative)

### Why Supabase?
- ✅ PostgreSQL + real-time features
- ✅ Free tier (500MB database)
- ✅ Built-in auth (optional)
- ✅ Dashboard for database management

### Setup Steps

1. **Create Project**
   - Visit: https://supabase.com
   - Create new project
   - Choose region and password

2. **Get Connection String**
   - Go to Project Settings → Database
   - Copy "Connection string" (URI format)
   - Replace `[YOUR-PASSWORD]` with your actual password

3. **Update `.env.local`**
   ```bash
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
   ```

4. **Run Migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run db:seed
   ```

---

## Option 5: PlanetScale (MySQL-Compatible)

### ⚠️ Note
PlanetScale uses MySQL, not PostgreSQL. You'll need to:
1. Change `provider = "postgresql"` to `provider = "mysql"` in `schema.prisma`
2. Adjust some data types (e.g., `@db.Text` might need changes)

**Recommendation:** Use PostgreSQL options above instead for easier setup.

---

## After Setup: Verify Everything Works

### 1. Check Prisma Client Generated
```bash
ls node_modules/.prisma/client
# Should see generated files
```

### 2. Test Database Connection
```bash
npm run db:studio
# Opens Prisma Studio at http://localhost:5555
# You should see your tables: User, Booking, Event, SiteContent, AuditLog
```

### 3. Verify Admin User
In Prisma Studio:
- Click on "User" table
- You should see one user with:
  - Email: `admin@xplorium.com`
  - Role: `SUPER_ADMIN`
  - Blocked: `false`

### 4. Check Migrations
```bash
ls prisma/migrations
# Should see a folder named like "20231118123456_init"
```

---

## Troubleshooting

### Error: "Can't reach database server"
- **Check:** Is your database running?
- **Local:** Run `sudo systemctl status postgresql` (Linux) or check Services (Windows)
- **Cloud:** Check database status in provider dashboard

### Error: "Authentication failed"
- **Check:** Username and password in `DATABASE_URL`
- **Local:** Default PostgreSQL user is usually `postgres`
- **Cloud:** Use exact credentials from provider

### Error: "Database does not exist"
- **Local:** Run `createdb xplorium` or `CREATE DATABASE xplorium;`
- **Cloud:** Database should be created automatically, check provider dashboard

### Error: "Prisma schema could not be loaded"
- **Check:** Run `npx prisma format` to validate schema
- **Check:** Make sure you're in the project root directory

### Error: "Environment variable not found: DATABASE_URL"
- **Check:** `.env.local` file exists in project root
- **Check:** Variable is spelled correctly: `DATABASE_URL` (all caps)
- **Check:** No spaces around `=` in the `.env.local` file

---

## Connection String Format

### PostgreSQL Format
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

**Example:**
```
postgresql://john:secretpassword@localhost:5432/xplorium
```

**Components:**
- `USER`: Database username (e.g., `postgres`)
- `PASSWORD`: Database password
- `HOST`: Server address (e.g., `localhost`, `db.vercel.com`)
- `PORT`: Usually `5432` for PostgreSQL
- `DATABASE`: Database name (e.g., `xplorium`)

### Special Characters in Password
If your password contains special characters, URL encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`

**Example:**
```bash
# Password: "my@pass:word"
DATABASE_URL="postgresql://user:my%40pass%3Aword@localhost:5432/xplorium"
```

---

## Security Best Practices

1. **Never commit `.env.local`**
   - Already in `.gitignore`
   - Contains database credentials

2. **Use strong passwords**
   - Minimum 16 characters
   - Mix of letters, numbers, symbols
   - Generate with: `openssl rand -base64 24`

3. **Restrict database access**
   - Only allow connections from your app
   - Use firewall rules (cloud providers)
   - Don't expose PostgreSQL port publicly (local)

4. **Regular backups**
   - Vercel Postgres: Automatic daily backups
   - Local: Set up `pg_dump` cron job
   - Other providers: Enable automatic backups

5. **Use connection pooling**
   - Vercel Postgres: Built-in with `POSTGRES_PRISMA_URL`
   - Local: Configure in Prisma (already done)
   - Prevents connection exhaustion

---

## Next Steps

After your database is set up:

1. ✅ Run migrations: `npx prisma migrate dev --name init`
2. ✅ Seed admin user: `npm run db:seed`
3. ✅ Verify in Prisma Studio: `npm run db:studio`
4. 🚀 **Proceed to Phase 2: Server Actions**

---

**Need Help?**

- [Prisma Docs](https://www.prisma.io/docs)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Neon Docs](https://neon.tech/docs)
- [Supabase Docs](https://supabase.com/docs)

---

*Last Updated: 2025-11-18*
