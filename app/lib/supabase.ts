'use client';
import { createClient } from '@supabase/supabase-js';
// Publishable key: authorization is enforced by PostgreSQL row-level security.
export const supabase = createClient(
  'https://setgmeuidsmodcssssha.supabase.co',
  'sb_publishable_OvN8cBR5wdHv0Qud9bItxw_kPfOQ032',
);
