import supabaseBackend from './backends/supabase.js'
import localBackend from './backends/local.js'

const mode = (import.meta.env.VITE_BACKEND || 'supabase').toLowerCase()
const canUseSupabase =
  !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY

let backend
if (mode === 'local') {
  backend = localBackend
} else if (canUseSupabase) {
  backend = supabaseBackend
} else {
  console.warn(
    '[gimme-money] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diisi — fallback ke mode lokal.',
  )
  backend = localBackend
}

export default backend
