# Safe Database Migration Guide

## Overview

The DriverOS database migration has been designed to be **idempotent**, meaning it can be run multiple times safely without causing errors or duplicate objects.

## Key Safety Features

### 1. ENUM Type Creation with Existence Checks

All ENUM types are created with existence checks:

```sql
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'terminalstatus') THEN
        CREATE TYPE "TerminalStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');
    END IF;
END $$;
```

### 2. Table Creation with Existence Checks

All tables are created with existence checks:

```sql
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'terminals') THEN
        CREATE TABLE "terminals" (
            -- table definition
        );
    END IF;
END $$;
```

### 3. Index and Constraint Safety

Unique indexes and foreign key constraints are created with proper error handling:

```sql
-- Create unique constraints (will fail gracefully if already exist)
CREATE UNIQUE INDEX IF NOT EXISTS "terminals_code_key" ON "terminals"("code");
```

## Migration Execution

### Safe Execution Steps

1. **Backup (Recommended)**
   ```sql
   -- Create a backup before running migration
   pg_dump your_database > backup_before_migration.sql
   ```

2. **Run Migration**
   ```sql
   -- Execute the migration in Supabase SQL Editor
   -- The migration will skip existing objects
   ```

3. **Verify Results**
   ```sql
   -- Check that all objects were created
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

### What Happens on Re-run

When you run the migration multiple times:

- ✅ **ENUM types**: Skipped if already exist
- ✅ **Tables**: Skipped if already exist  
- ✅ **Indexes**: Created with `IF NOT EXISTS`
- ✅ **Foreign Keys**: Created with proper error handling
- ✅ **RLS Policies**: Created with `IF NOT EXISTS`

## Error Handling

### Common Scenarios

1. **ENUM Already Exists**
   ```sql
   -- This will be skipped safely
   ERROR: type "terminalstatus" already exists
   ```

2. **Table Already Exists**
   ```sql
   -- This will be skipped safely
   ERROR: relation "terminals" already exists
   ```

3. **Index Already Exists**
   ```sql
   -- This will be skipped safely
   NOTICE: relation "terminals_code_key" already exists, skipping
   ```

### Recovery Procedures

If something goes wrong:

1. **Check Current State**
   ```sql
   -- List all tables
   \dt
   
   -- List all types
   \dT
   ```

2. **Manual Cleanup (if needed)**
   ```sql
   -- Drop specific objects if needed
   DROP TABLE IF EXISTS terminals CASCADE;
   DROP TYPE IF EXISTS "TerminalStatus" CASCADE;
   ```

3. **Re-run Migration**
   ```sql
   -- Migration will create missing objects only
   ```

## Best Practices

### 1. Always Test in Development First
- Run migration in a development environment
- Verify all objects are created correctly
- Test application functionality

### 2. Use Transaction Blocks
```sql
BEGIN;
-- Run migration here
COMMIT;
-- or ROLLBACK if needed
```

### 3. Monitor Execution
- Watch for any error messages
- Verify expected objects are created
- Check application connectivity

### 4. Backup Before Production
```bash
# Create backup before running in production
pg_dump production_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Migration File Structure

The migration file follows this structure:

1. **ENUM Creation** (with existence checks)
2. **Table Creation** (with existence checks)
3. **Index Creation** (with IF NOT EXISTS)
4. **Foreign Key Creation** (with proper constraints)
5. **RLS Setup** (with IF NOT EXISTS)
6. **Policy Creation** (with IF NOT EXISTS)

## Verification Commands

After running the migration, verify with these commands:

```sql
-- Check all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check all ENUM types
SELECT typname FROM pg_type 
WHERE typtype = 'e' 
ORDER BY typname;

-- Check all indexes
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;

-- Check foreign keys
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY' 
ORDER BY tc.table_name;
```

## Troubleshooting

### Migration Fails Partially

If the migration fails partway through:

1. **Check what was created**
   ```sql
   \dt
   \dT
   ```

2. **Identify missing objects**
   - Compare with expected schema
   - Note which objects exist

3. **Re-run migration**
   - Migration will skip existing objects
   - Only create missing objects

### Permission Issues

If you get permission errors:

1. **Check user permissions**
   ```sql
   SELECT current_user;
   ```

2. **Verify database access**
   ```sql
   SELECT current_database();
   ```

3. **Contact database administrator** if needed

### Connection Issues

If you can't connect to run the migration:

1. **Check connection string**
2. **Verify network access**
3. **Check firewall settings**
4. **Verify credentials**

## Summary

The DriverOS migration is designed to be:
- ✅ **Safe**: Can be run multiple times
- ✅ **Idempotent**: No side effects on re-run
- ✅ **Robust**: Handles errors gracefully
- ✅ **Verifiable**: Easy to check results
- ✅ **Recoverable**: Can be fixed if issues occur

This ensures a smooth deployment experience in any environment.
