import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fhgtzkcbbrekprmakssb.supabase.co';
const supabaseAnonKey = 'sb_publishable_mplcaSTzvAtfv-IUEJW3fA_eA4geyCI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);