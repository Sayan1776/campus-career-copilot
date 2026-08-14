// Supabase client for browser use. Auth is handled entirely by Firebase —
// Supabase here is used purely as the data layer (resumes, jds, company_visits).
// So we use the public anon key; row-level security policies restrict what
// each request can touch, keyed off the Firebase UID we pass in manually.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
