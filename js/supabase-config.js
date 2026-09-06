// ==============================================================================
// CONFIGURATION SUPABASE — NANO DESIGN STUDIO DAKAR
// ==============================================================================
// RÈGLE DE SÉCURITÉ CRITIQUE :
// Seule la clé PUBLIQUE "anon" (ou publishable) doit être utilisée ici.
// Ne JAMAIS renseigner la clé "service_role" (clé secrète maître) dans le code front-end.
// ==============================================================================

(function () {
  'use strict';

  const storedUrl = localStorage.getItem('nano_supabase_url') || 'https://cdttbypmfpzqmwtmkqjk.supabase.co';
  let storedKey = localStorage.getItem('nano_supabase_key') || 'sb_publishable_m77_5YvDdFHy0vbiKcc2sQ_8zZ0LDzf';

  // Détection et blocage de sécurité en cas de clé service_role accidentelle
  if (storedKey && (storedKey.includes('service_role') || storedKey.startsWith('sb_secret_'))) {
    console.error('ALERTE SÉCURITÉ : Une clé service_role confidentielle a été détectée. Elle est bloquée côté client pour votre sécurité.');
    storedKey = 'sb_publishable_m77_5YvDdFHy0vbiKcc2sQ_8zZ0LDzf';
  }

  const storedEmailKey = localStorage.getItem('nano_web3forms_key') || '0619d3e7-cf84-49b4-8ec6-05b9d9c6245f';

  window.SUPABASE_CONFIG = {
    url: storedUrl,
    anonKey: storedKey,
    emailKey: storedEmailKey
  };
})();
