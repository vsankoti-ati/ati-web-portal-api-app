# TypeORM Migrations Guide

## Overview
All migration files have been created in `backend/src/migrations/` folder.

## Migration Files Created

1. **1700000001000-CreateUsersTable.ts** - Users authentication table
2. **1700000002000-CreateEmployeesTable.ts** - Employee information
3. **1700000003000-CreateAddressesTable.ts** - Employee addresses
4. **1700000004000-CreateLeavesAndApplicationsTable.ts** - Leave management
5. **1700000005000-CreateJobsTable.ts** - Job openings and referrals
6. **1700000006000-CreateTimesheetsAndProjectsTable.ts** - Timesheets, projects, time entries
7. **1700000007000-CreateHolidaysAnnouncementsDocumentsTable.ts** - Holidays, announcements, documents

## Running Migrations

### Step 1: Create Database
First, create the database in SQL Server:
```sql
CREATE DATABASE ati_web_portal;
```

### Step 2: Run Migrations
Execute migrations to create all tables:
```bash
cd backend
npm run migration:run
```

### Step 3: Verify Tables
Check SQL Server to confirm all 13 tables were created:
- users
- employees
- addresses
- leaves
- leave_applications
- job_openings
- job_referrals
- projects
- timesheets
- time_entries
- holidays
- announcements
- documents

## Migration Commands

```bash
# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show

# Generate new migration from entity changes
npm run migration:generate -- src/migrations/MigrationName

# Create empty migration file
npm run migration:create -- src/migrations/MigrationName
```

## Important Notes

1. **Order Matters**: Migrations run in timestamp order (filename prefix)
2. **Foreign Keys**: Tables with foreign keys are created after their referenced tables
3. **Rollback**: Use `migration:revert` to undo the last migration
4. **Production**: Always test migrations in development first!

## Troubleshooting

**Error: "Cannot find module 'data-source'"**
- Solution: Ensure `src/data-source.ts` exists

**Error: "Connection failed"**
- Solution: Check `.env` database credentials
- Verify SQL Server is running
- Ensure TCP/IP is enabled on port 1433

**Error: "Table already exists"**
- Solution: Either drop existing tables or skip that migration

## Next Steps

After running migrations:
1. ✅ Tables created
2. ⏳ Seed initial data (users, employees, etc.)
3. ⏳ Test with frontend
4. ⏳ Switch `USE_MOCK_DATA=false` in `.env`

## Data Seeding

After migrations, you'll need to populate initial data. Options:
1. Manual SQL INSERT statements
2. Create a seeder script (we can build this)
3. Import from mock JSON files

Would you like me to create a data seeder script?
