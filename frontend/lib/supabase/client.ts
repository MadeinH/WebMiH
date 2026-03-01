import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente Supabase para uso en componentes del navegador.
 * Se activará cuando se conecten las páginas a datos dinámicos de Supabase.
 * Actualmente el catálogo usa datos estáticos hardcodeados.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Faltan variables de entorno de Supabase para el cliente')
  }

  return createBrowserClient(url, anonKey)
}
