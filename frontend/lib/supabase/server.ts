import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/** Cliente Supabase para uso en Server Components y API Routes */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Faltan variables de entorno de Supabase para el servidor')
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false },
  })
}
