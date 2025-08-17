export const supabaseConfig = {
  url: 'https://cubaxcawnlhtvipdktim.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1YmF4Y2F3bmxodnRpcGRrdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTQyNjEsImV4cCI6MjA3MTAzMDI2MX0.KPTdHStVDYksE7yBQmnr3Dd9a_xNNGtEYIMtUj45NV4',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  projectId: 'cubaxcawnlhtvipdktim',
};

// Database connection string template
export const getDatabaseUrl = (password?: string) => {
  if (!password) {
    return 'postgresql://postgres.cubaxcawnlhvtipdktim:Gariba1ddi@aws-1-eu-north-1.pooler.supabase.com:5432/postgres';
  }
  return `postgresql://postgres.cubaxcawnlhvtipdktim:${password}@aws-1-eu-north-1.pooler.supabase.com:5432/postgres`;
};

// Direct connection string (for migrations and direct access)
export const DIRECT_DATABASE_URL = 'postgresql://postgres:Gariba1ddi@db.cubaxcawnlhvtipdktim.supabase.co:5432/postgres';

// Transaction pooler connection string (for high-concurrency applications)
export const TRANSACTION_POOLER_URL = 'postgres://postgres:Gariba1ddi@db.cubaxcawnlhvtipdktim.supabase.co:6543/postgres';

// Session pooler connection string (for long-lived connections)
export const SESSION_POOLER_URL = 'postgresql://postgres.cubaxcawnlhvtipdktim:Gariba1ddi@aws-1-eu-north-1.pooler.supabase.com:5432/postgres';
