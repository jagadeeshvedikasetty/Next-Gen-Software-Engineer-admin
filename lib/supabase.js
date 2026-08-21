import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zylaputsexixoxtlomhs.supabase.co';
const supabaseKey = 'sb_publishable_pUpduqaND1jmxQeZbyicFw_NkQndTf8';

export const supabase = createClient(supabaseUrl, supabaseKey);
