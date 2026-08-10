// Supabase config.
// Una itong kumukuha mula sa environment variables (.env / .env.local). Kung wala,
// babalik sa dati mong values para HINDI masira agad ang app. Para makapag-hiwalay
// ng dev at prod na project, gumawa ng .env.local (tingnan ang .env.example) at
// ilagay doon ang VITE_SUPABASE_* na values.
//
// Paalala: publishable (public) ang anon key na ito — ligtas siyang nasa client.
export const projectId =
  import.meta.env.VITE_SUPABASE_PROJECT_ID || "tsygrgqrdcarodlhffkt";

export const publicAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_IxCtwkP8vFDBpkR6i4KlcA_5zS_YyHy";
