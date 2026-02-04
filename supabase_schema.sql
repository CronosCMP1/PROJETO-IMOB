-- 1. Create the 'leads' table
-- We use double quotes "ColumnName" to preserve camelCase.
-- This ensures the database columns match your TypeScript 'Listing' interface automatically.

CREATE TABLE IF NOT EXISTS public.leads (
    id text PRIMARY KEY,
    title text,
    price numeric,
    currency text,
    location text,
    neighborhood text,
    description text,
    "sellerType" text,
    "operationType" text,
    "sellerName" text,
    platform text,
    url text,
    phone text,
    "confidenceScore" numeric,
    "scrapedAt" timestamp with time zone,
    features text[], -- Stores string[] from JSON
    status text DEFAULT 'NEW'
);

-- 2. Add Data Integrity Constraint for Status
-- This ensures only valid pipeline statuses can be inserted.
ALTER TABLE public.leads 
ADD CONSTRAINT status_check 
CHECK (status IN ('NEW', 'CONTACTED', 'VISIT', 'NEGOTIATION', 'CLOSED', 'LOST'));

-- 3. Enable Row Level Security (RLS)
-- This is a security best practice for Supabase.
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 4. Create Access Policy
-- Since we are not using Supabase Auth (Login) yet, we allow public (anonymous) access.
-- WARNING: In a real production app with users, you would change this to `TO authenticated`.

CREATE POLICY "Enable read/write access for all users"
ON public.leads
FOR ALL
USING (true)
WITH CHECK (true);