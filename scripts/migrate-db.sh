#!/bin/bash

# DriverOS Database Migration Script
# This script helps migrate the database schema to Supabase

set -e

echo "🚀 Starting DriverOS database migration..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
fi

# Load environment variables
source .env

echo "📊 Database URL: $DATABASE_URL"
echo "🔗 Direct URL: $DIRECT_URL"

# Function to check if Supabase CLI is available
check_supabase_cli() {
    if command -v supabase &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to check if we can connect to the database
test_connection() {
    echo "🔍 Testing database connection..."
    
    cd packages/backend
    
    # Test with Prisma
    if npx prisma db pull --schema=prisma/schema.prisma > /dev/null 2>&1; then
        echo "✅ Database connection successful!"
        return 0
    else
        echo "❌ Database connection failed!"
        return 1
    fi
}

# Function to execute migration via Supabase CLI
migrate_via_cli() {
    echo "🔄 Attempting migration via Supabase CLI..."
    
    # Check if logged in
    if ! supabase projects list > /dev/null 2>&1; then
        echo "🔐 Please login to Supabase CLI first:"
        echo "   supabase login"
        return 1
    fi
    
    # Link project
    echo "🔗 Linking project..."
    supabase link --project-ref cubaxcawnlhtvipdktim
    
    # Push migration
    echo "📤 Pushing migration..."
    supabase db push
    
    echo "✅ Migration completed via CLI!"
}

# Function to provide manual instructions
provide_manual_instructions() {
    echo ""
    echo "📋 Manual Migration Instructions:"
    echo "================================"
    echo ""
    echo "1. Open Supabase Dashboard: https://supabase.com/dashboard"
    echo "2. Select project: cubaxcawnlhtvipdktim"
    echo "3. Go to SQL Editor"
    echo "4. Create new query"
    echo "5. Copy and paste the contents of: packages/backend/prisma/migration.sql"
    echo "6. Click 'Run' to execute"
    echo ""
    echo "📁 SQL file location: packages/backend/prisma/migration.sql"
    echo ""
}

# Main execution
echo "🔧 Checking prerequisites..."

# Check if Supabase CLI is available
if check_supabase_cli; then
    echo "✅ Supabase CLI found"
    
    # Try CLI migration first
    if migrate_via_cli; then
        echo "🎉 Migration completed successfully!"
        exit 0
    else
        echo "⚠️  CLI migration failed, falling back to manual instructions"
    fi
else
    echo "⚠️  Supabase CLI not found"
fi

# Test database connection
if test_connection; then
    echo "✅ Database is accessible"
else
    echo "❌ Cannot connect to database"
    echo "   Please check your connection strings in .env file"
    echo "   Make sure the database is running and accessible"
fi

# Provide manual instructions
provide_manual_instructions

echo "📖 For detailed instructions, see: SUPABASE_MIGRATION_INSTRUCTIONS.md"
echo ""
echo "🔍 After migration, you can test the connection with:"
echo "   cd packages/backend"
echo "   npx prisma db pull"
echo ""
echo "🌱 To seed the database with test data:"
echo "   cd packages/backend"
echo "   npx prisma db seed"
