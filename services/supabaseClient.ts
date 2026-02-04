import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ynaypgdubmmlvbrjftum.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6hk-6WdFMa2narVn2bcwvQ_6XFx9sEh';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);