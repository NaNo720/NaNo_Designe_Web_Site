// ==============================================================================
// CONFIGURATION SUPABASE — NANO DESIGN STUDIO DAKAR
// ==============================================================================
// Vous pouvez renseigner directement vos identifiants ci-dessous, ou les saisir 
// depuis le tableau de bord Admin (ils seront conservés en mémoire sécurisée).
// Pour trouver ces valeurs : Console Supabase > Project Settings > API
// ==============================================================================

window.SUPABASE_CONFIG = {
  // URL de votre projet Supabase
  url: localStorage.getItem('nano_supabase_url') || 'https://cdttbypmfpzqmwtmkqjk.supabase.co',

  // Clé publique anon / publishable
  anonKey: localStorage.getItem('nano_supabase_key') || 'sb_publishable_m77_5YvDdFHy0vbiKcc2sQ_8zZ0LDzf'
};
