// ── SSPP SUPABASE CLIENT ──
// Edit ONLY these two values when you have your credentials.
// All other JS files reference _supabase — never put credentials elsewhere.

var SUPABASE_URL = 'https://lmkrcjhcixlgetginvbs.supabase.co';
var SUPABASE_KEY = 'sb_publishable_abzZlIOK1gxs7Z_JHjLn3Q_T08KNDUU';

var _supabase;
try {
  _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch(e) {
  console.warn('Supabase init failed:', e.message);
  _supabase = null;
}
